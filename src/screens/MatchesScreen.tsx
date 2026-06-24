import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

import { getLiveMatches } from "../services/api";

export default function MatchesScreen() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();

    const interval = setInterval(load, 10000); // 🔴 más real-time

    return () => clearInterval(interval);
  }, []);

  const load = async () => {
    try {
      const data = await getLiveMatches();
      setMatches(data);
    } catch (err) {
      console.log("Error loading matches:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (item: any) => {
    const status = item.fixture.status.short;
    const elapsed = item.fixture.status.elapsed;

    // 🔴 EN VIVO
    if (status === "1H" || status === "2H" || status === "LIVE") {
      return `🔴 EN VIVO • ${elapsed || 0}'`;
    }

    // ⏳ ENTRETIEMPO
    if (status === "HT") {
      return "⏸ DESCANSO";
    }

    // ✔ TERMINADO
    if (status === "FT") {
      return "✔ FINALIZADO";
    }

    return item.fixture.status.long;
  };

  const renderMatch = ({ item }: any) => {
    const home = item.teams.home.name;
    const away = item.teams.away.name;

    const homeGoals = item.goals.home ?? 0;
    const awayGoals = item.goals.away ?? 0;

    const isLive =
      item.fixture.status.short === "1H" ||
      item.fixture.status.short === "2H";

    return (
      <View style={[styles.card, isLive && styles.liveCard]}>
        {/* League */}
        <Text style={styles.league}>
          🏆 {item.league.name}
        </Text>

        {/* Teams + Score */}
        <View style={styles.row}>
          <Text style={styles.team}>{home}</Text>

          <View style={styles.scoreBox}>
            <Text style={styles.score}>
              {homeGoals} - {awayGoals}
            </Text>
          </View>

          <Text style={styles.team}>{away}</Text>
        </View>

        {/* Status */}
        <Text style={[styles.status, isLive && styles.liveStatus]}>
          {getStatusLabel(item)}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>⚽ Live Scores</Text>

      {loading && matches.length === 0 ? (
        <ActivityIndicator size="large" color="#22c55e" />
      ) : matches.length === 0 ? (
        <Text style={styles.empty}>
          🔴 No hay partidos en vivo ahora mismo
        </Text>
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(item) =>
            item.fixture.id.toString()
          }
          renderItem={renderMatch}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b1220",
    padding: 15,
  },

  title: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 15,
  },

  card: {
    backgroundColor: "#111827",
    padding: 15,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1f2937",
  },

  liveCard: {
    borderColor: "#ef4444",
    shadowColor: "#ef4444",
    shadowOpacity: 0.4,
  },

  league: {
    color: "#94a3b8",
    fontSize: 12,
    marginBottom: 10,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  team: {
    color: "#fff",
    fontSize: 14,
    flex: 1,
    textAlign: "center",
  },

  scoreBox: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#0f172a",
    borderRadius: 10,
  },

  score: {
    color: "#22c55e",
    fontSize: 20,
    fontWeight: "bold",
  },

  status: {
    marginTop: 10,
    color: "#60a5fa",
    fontSize: 12,
    textAlign: "center",
  },

  liveStatus: {
    color: "#ef4444",
    fontWeight: "bold",
  },

  empty: {
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 20,
  },
});