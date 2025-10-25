import React, { useState, useMemo, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { getTheme } from './theme/theme';
import { isAuthenticated } from './utils/auth';
import Login from './components/Auth/Login';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import AddVehicle from './pages/admin-master/vehicle/AddVehicle';
import ListVehicle from './pages/admin-master/vehicle/ListVehicle';
import ViewVehicle from './pages/admin-master/vehicle/ViewVehicle';
import EditVehicle from './pages/admin-master/vehicle/EditVehicle';
import ListAttendee from './pages/admin-master/attendee/ListAttendee';
import AddAttendee from './pages/admin-master/attendee/AddAttendee';
import EditAttendee from './pages/admin-master/attendee/EditAttendee';
import ViewAttendee from './pages/admin-master/attendee/ViewAttendee';

import axios from "axios";
import AddSupervisor from './pages/admin-master/supervisor/AddSupervisor';
import ListSupervisor from './pages/admin-master/supervisor/ListSupervisor';
import ViewSupervisor from './pages/admin-master/supervisor/ViewSupervisor';
import EditSupervisor from './pages/admin-master/supervisor/EditSupervisor';



import AddDriver from './pages/admin-master/driver/AddDriver';
import ListDriver from './pages/admin-master/driver/ListDriver';
import ViewDriver from './pages/admin-master/driver/ViewDriver';
import EditDriver from './pages/admin-master/driver/EditDriver';

import AddGroup from './pages/admin-master/group/AddGroup';
import ListGroup from './pages/admin-master/group/ListGroup';
import EditGroup from './pages/admin-master/group/EditGroup';
import ViewGroup from './pages/admin-master/group/ViewGroup';



import DriverDashboard from './pages/DriverDashboard';
import ClockInOut from './pages/driver-master/ClockInOut';
import TicketRaise from './pages/driver-master/TicketRaise';
import DriverSchedule from './pages/driver-master/Schedule';


import SupervisorDashboard from './pages/SupervisorDashboard';
import  AssignDriver from './pages/supervisor-master/AssignDriver';
import  ListAssignAttendee from './pages/supervisor-master/ListAssignAttendee';


import VehicleInfo from './pages/driver-master/VehicleInfo';
import TicketHistory from './pages/driver-master/TicketHistory';
import DriverClockIn from './pages/admin-master/reports/DriverClockIn';
import ViewDriverClockIn from './pages/admin-master/reports/ViewDriverClockIn';
import DriverTicket from './pages/admin-master/reports/DriverTicket';
import ViewDriverTicket from './pages/admin-master/reports/ViewDriverTicket';
import ListAssignDriver from './pages/supervisor-master/ListAssignDriver';
import AssignAttendee from './pages/supervisor-master/AssignAttendee';



export const ThemeContext = createContext();

function App() {
  const [mode, setMode] = useState('light');
  const theme = useMemo(() => getTheme(mode), [mode]);

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const ProtectedRoute = ({ children }) => {
    return isAuthenticated() ? children : <Navigate to="/login" />;
  };

  const PublicRoute = ({ children }) => {
    return !isAuthenticated() ? children : <Navigate to="/dashboard" />;
  };

  return (
    <ThemeContext.Provider value={{ mode, toggleColorMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />



            <Route
              path="/add-vehicle"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AddVehicle />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/list-vehicle"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ListVehicle />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route path="/view-vehicle" element={<ViewVehicle />} />
            <Route
              path="/edit-vehicle"
              element={
                <ProtectedRoute>
                  <Layout>
                    <EditVehicle />
                  </Layout>
                </ProtectedRoute>
              }
            />


            {/* supervisor route */}
            <Route
              path="/add-supervisor"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AddSupervisor />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/list-supervisor"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ListSupervisor />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route path="/view-supervisor" element={<ViewSupervisor />} />

            <Route
              path="/edit-supervisor"
              element={
                <ProtectedRoute>
                  <Layout>
                    <EditSupervisor />
                  </Layout>
                </ProtectedRoute>
              }
            />


            {/* driver route */}
            <Route
              path="/add-driver"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AddDriver />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/list-driver"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ListDriver />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route path="/view-driver" element={<ViewDriver />} />
            <Route
              path="/edit-driver"
              element={
                <ProtectedRoute>
                  <Layout>
                    <EditDriver />
                  </Layout>
                </ProtectedRoute>
              }
            />


            {/* attendee route */}
            <Route
              path="/add-attendee"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AddAttendee />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/list-attendee"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ListAttendee />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/edit-attendee"
              element={
                <ProtectedRoute>
                  <Layout>
                    <EditAttendee />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route path="/view-attendee" element={<ViewAttendee />} />



            {/* group route */}
            <Route
              path="/add-group"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AddGroup />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/list-group"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ListGroup />
                  </Layout>
                </ProtectedRoute>
              }
            />
            {/* <Route
              path="/edit-group"
              element={
                <ProtectedRoute>
                  <Layout>
                    <EditGroup />
                  </Layout>
                </ProtectedRoute>
              }
            /> */}
            <Route path="/view-group" element={<ViewGroup />} />

            <Route
              path="/edit-group"
              element={
                <ProtectedRoute>
                  <Layout>
                    <EditGroup />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/report-driverClockInReport"
              element={
                <ProtectedRoute>
                  <Layout>
                    <DriverClockIn />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/report-driverTicket"
              element={
                <ProtectedRoute>
                  <Layout>
                    <DriverTicket />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/report-viewDriverTicket"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ViewDriverTicket />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/assign-driver"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AssignDriver />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/list-assignDriver"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ListAssignDriver />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/assign-attendee"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AssignAttendee />
                  </Layout>
                </ProtectedRoute>
              }
            />

              <Route
              path="/list-assignAttendee"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ListAssignAttendee />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/report-viewDriverClockIn"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ViewDriverClockIn />
                  </Layout>
                </ProtectedRoute>
              }
            />




            {/*=================== Driver Routes ============== */}
            <Route
              path="/driver-dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <DriverDashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/driver-clockInOut"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ClockInOut />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/driver-ticketRaise"
              element={
                <ProtectedRoute>
                  <Layout>
                    <TicketRaise />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/driver-ticketHistory"
              element={
                <ProtectedRoute>
                  <Layout>
                    <TicketHistory />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/driver-vehicleInfo"
              element={
                <ProtectedRoute>
                  <Layout>
                    <VehicleInfo />
                  </Layout>
                </ProtectedRoute>
              }
            />

             <Route
              path="/driver-schedule"
              element={
                <ProtectedRoute>
                  <Layout>
                    <DriverSchedule />
                  </Layout>
                </ProtectedRoute>
              }
            />



            {/* Supervisor Dashboard */}
            <Route
              path="/supervisor-dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <SupervisorDashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />


            <Route path="/" element={<Navigate to="/login" />} />            {/* Add 404 route */}
            <Route path="*" element={<Navigate to="/dashboard" />} />

          </Routes>
        </Router>
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}

export default App;