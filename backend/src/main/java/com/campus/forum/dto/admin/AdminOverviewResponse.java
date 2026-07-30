package com.campus.forum.dto.admin;

public record AdminOverviewResponse(
        long totalUsers,
        long activeUsers,
        long bannedUsers,
        long publishedPosts,
        long pendingPosts,
        long pendingConfesses,
        long pendingActivities,
        long pendingReports) {
    public long pendingContent() {
        return pendingPosts + pendingConfesses;
    }
}
