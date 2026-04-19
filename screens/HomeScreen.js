// ...existing code...
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { COLORS } from "../utils/colors";
import { apiClient } from "../utils/api";

export default function HomeScreen() {
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalCount: 0,
    limits: 5,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function fetchPosts() {
      try {
        setLoading(true);
        setError(null);

        // first try primary endpoint
        let res;
        try {
          res = await apiClient.get("/post", {
            params: { page: pagination.currentPage, limit: pagination.limits },
          });
        } catch (err) {
          // If 404 try fallback "/posts"
          if (err?.response?.status === 404) {
            console.warn("/post returned 404, trying /posts");
            res = await apiClient.get("/posts", {
              params: { page: pagination.currentPage, limit: pagination.limits },
            });
          } else {
            throw err;
          }
        }

        // log full response to help debugging
        console.debug("fetchPosts response:", res?.status, res?.data);

        // handle a few possible response shapes and avoid crashes
        const postsData =
          res?.data?.data?.posts ??
          res?.data?.data?.possts ??
          res?.data?.data ??
          [];

        if (!mounted) return;

        setPosts(Array.isArray(postsData) ? postsData : []);
        const meta = res?.data?.data?.pagination ?? {};

        setPagination((prev) => ({
          ...prev,
          totalPages: meta.totalPages ?? prev.totalPages,
          totalCount: meta.totalCount ?? prev.totalCount,
        }));
      } catch (err) {
        console.error("Failed to fetch posts:", err);
        setError(err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchPosts();
    return () => {
      mounted = false;
    };
  }, [pagination.currentPage, pagination.limits]);

  function renderPost({ item }) {
    return (
      <TouchableOpacity style={styles.postCard} activeOpacity={0.8}>
        <Text style={styles.postTitle}>{item.title ?? "Untitled"}</Text>
        <Text style={styles.postBody} numberOfLines={2}>
          {item.content ?? ""}
        </Text>
      </TouchableOpacity>
    );
  }

  function onRetry() {
    setPagination((p) => ({ ...p })); // trigger useEffect by keeping deps same but re-rendering
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Home</Text>
      <Text style={styles.body}>Home screen – posts feed will appear here.</Text>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
      ) : error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>Failed to load posts.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item, idx) => (item?.id ? String(item.id) : String(idx))}
          renderItem={renderPost}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No posts yet.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 6,
  },
  body: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  list: {
    paddingVertical: 8,
  },
  postCard: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary,
    marginBottom: 4,
  },
  postBody: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  empty: {
    textAlign: "center",
    color: COLORS.textSecondary,
    marginTop: 24,
  },
  errorBox: {
    marginTop: 24,
    alignItems: "center",
  },
  errorText: {
    color: "#B00020",
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  retryText: {
    color: "#fff",
    fontWeight: "600",
  },
});