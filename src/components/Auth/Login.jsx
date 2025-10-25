import React, { useState } from "react";
import {
  Box,
  Card,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
} from "@mui/material";
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Use URLSearchParams to send form data as required by your FastAPI backend
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('isLoggedIn', 'true');

        // Decode JWT token to get user role and ID
        const userRole = data.role_id; // ← Direct from API response
        const userId = JSON.parse(atob(data.access_token.split('.')[1])).user_id;

        // Fetch user details based on role
        const userResponse = await fetch(`${API_BASE_URL}/user-details/${userId}`, {
          headers: {
            'Authorization': `Bearer ${data.access_token}`
          }
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          localStorage.setItem('userRole', userRole);
          localStorage.setItem('userData', JSON.stringify(userData));

          // Redirect based on role
          if (userRole === 3) { // Driver role
            navigate('/driver-clockInOut');
          } else if (userRole === 2) { // Supervisor role
            navigate('/assign-driver');
          } else { // Admin/Other roles
            navigate('/dashboard');
          }
        } else {
          setError('Failed to fetch user details');
        }
      } else {
        setError(data.detail || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Server error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "70vh",
        mx: { xs: 0, md: 30 },
        my: { xs: 0, md: 12 },
        flexDirection: { xs: "column", md: "row" },
      }}
    >
      {/* Left side (Login Form) */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fff",
          p: { xs: 3, sm: 6, md: 8 },
        }}
      >
        <Card
          component={motion.div}
          sx={{
            boxShadow: "none",
            background: "transparent",
            width: "100%",
            maxWidth: 400,
            transition: "none",
            "&:hover": {
              boxShadow: "none",
              background: "transparent",
              transform: "none",
            },
          }}
        >
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography
              variant="h4"
              sx={{ fontWeight: "bold", color: "#111", mb: 1 }}
            >
              Login to Your Account
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Username & Password fields */}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  background: "#f8f8f8",
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  background: "#f8f8f8",
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                py: 1.4,
                borderRadius: 25,
                backgroundColor: "#DC143C",
                fontWeight: 600,
                fontSize: "1rem",
                "&:hover": {
                  backgroundColor: "#B22222",
                },
              }}
            >
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </form>
        </Card>
      </Box>

      {/* Right Side (Crimson Red Panel) */}
      <Box
        component={motion.div}
        sx={{
          flex: 1,
          background: "linear-gradient(135deg, #B22222, #DC143C)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          p: { xs: 5, sm: 8 },
          textAlign: "center",
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: "bold", mb: 2, color: "#fff" }}
          >
            Transport Management System
          </Typography>
          <Typography
            variant="body1"
            sx={{ maxWidth: 320, mx: "auto", mb: 3, opacity: 0.9 }}
          >
            Welcome to the Transport Management System – your one-stop solution for managing vehicles, drivers, and schedules efficiently. Please login to continue.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;