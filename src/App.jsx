import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { HomePage } from "./HomePage.jsx";
import { authStore } from "./api.js";
import {
  ActivityDetailPage,
  ActivityPage,
  AdminPage,
  AdminLoginPage,
  AuthPage,
  ConfessDetailPage,
  ConfessPage,
  EditorPage,
  FriendPage,
  ForumDetailPage,
  ForumPage,
  MessagePage,
  NewsDetailPage,
  NewsPage,
  NoticePage,
  PersonalCenterPage,
  SearchPage,
  UserSpacePage,
} from "./Portal.jsx";

function Guard({ children }) {
  const authed = Boolean(localStorage.getItem("campus-access-token"));
  return authed ? children : <Navigate to="/login" replace />;
}

function AdminGuard({ children }) {
  return authStore.access() && authStore.isAdmin() ? children : <Navigate to="/admin/login" replace />;
}

export function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route path="/forgot-password" element={<AuthPage mode="forgot" />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/confess" element={<ConfessPage />} />
        <Route path="/confess/new" element={<Guard><EditorPage type="confess" /></Guard>} />
        <Route path="/confess/:id" element={<ConfessDetailPage />} />
        <Route path="/forum" element={<ForumPage />} />
        <Route path="/forum/new" element={<Guard><EditorPage type="forum" /></Guard>} />
        <Route path="/forum/:id" element={<ForumDetailPage />} />
        <Route path="/activities" element={<ActivityPage />} />
        <Route path="/activities/new" element={<Guard><EditorPage type="activity" /></Guard>} />
        <Route path="/activities/:id" element={<ActivityDetailPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/news/:id" element={<NewsDetailPage type="news" />} />
        <Route path="/notices" element={<NoticePage />} />
        <Route path="/notices/:id" element={<NewsDetailPage type="notice" />} />
        <Route path="/users/:id" element={<UserSpacePage />} />
        <Route path="/friends" element={<Guard><FriendPage /></Guard>} />
        <Route path="/friends/requests" element={<Guard><FriendPage tab="requests" /></Guard>} />
        <Route path="/messages" element={<Guard><MessagePage /></Guard>} />
        <Route path="/messages/:id" element={<Guard><MessagePage conversation /></Guard>} />
        <Route path="/me" element={<Guard><PersonalCenterPage /></Guard>} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminGuard><AdminPage /></AdminGuard>} />
        <Route path="/admin/:section" element={<AdminGuard><AdminPage /></AdminGuard>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
