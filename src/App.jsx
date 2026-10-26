import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SectionPlaceholder from "@/components/layout/SectionPlaceholder";
import { dashboardPages } from "@/app/navigation";
import DashboardPage from "@/features/dashboard/DashboardPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          {dashboardPages.map((page) => (
            <Route
              element={<SectionPlaceholder title={page.title} />}
              key={page.path}
              path={page.path}
            />
          ))}
          <Route path="*" element={<Navigate replace to="/" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
