// ...existing code...
import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    Alert,
    Pressable,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from "react-native";
import { COLORS } from "../utils/colors";
import { useState } from "react";
import { apiClient } from "../utils/api";

export default function AddPostScreen() {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit() {
        try {
            setLoading(true);
            const response = await apiClient.post("/post", { title, content });
            console.log("Post created:", response.data);
            setTitle("");
            setContent("");
            Alert.alert("Success", "Post created successfully");
        } catch (error) {
            console.error("Create post error:", error);
            Alert.alert("Error", "Failed to create post");
        } finally {
            setLoading(false);
        }
    }

    const disabled = loading || title.trim() === "" || content.trim() === "";

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                <View style={styles.card}>
                    <Text style={styles.heading}>Add Post</Text>
                    <Text style={styles.body}>Create a new blog post below.</Text>

                    <Text style={styles.label}>Title</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter a short title"
                        value={title}
                        onChangeText={setTitle}
                        returnKeyType="next"
                        editable={!loading}
                    />

                    <Text style={styles.label}>Content</Text>
                    <TextInput
                        style={styles.textarea}
                        placeholder="Write your post..."
                        value={content}
                        onChangeText={setContent}
                        multiline
                        textAlignVertical="top"
                        editable={!loading}
                        numberOfLines={8}
                    />

                    <Pressable
                        style={[styles.button, disabled && styles.buttonDisabled]}
                        onPress={handleSubmit}
                        disabled={disabled}
                    >
                        <Text style={styles.buttonText}>{loading ? "Posting..." : "Create Post"}</Text>
                    </Pressable>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: COLORS.background,
        flexGrow: 1,
        justifyContent: "center",
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 18,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 3,
        alignItems: "stretch",
    },
    heading: {
        fontSize: 22,
        fontWeight: "700",
        color: COLORS.primary,
        marginBottom: 6,
        textAlign: "left",
    },
    body: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: 12,
    },
    label: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginTop: 10,
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: "#E6E6E6",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: "#FAFAFA",
        fontSize: 16,
    },
    textarea: {
        borderWidth: 1,
        borderColor: "#E6E6E6",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: "#FAFAFA",
        fontSize: 16,
        height: 140,
    },
    button: {
        marginTop: 16,
        backgroundColor: COLORS.primary,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    buttonDisabled: {
        backgroundColor: "#BDBDBD",
    },
    buttonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 16,
    },
});