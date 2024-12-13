import {
  createFileRoute,
  Navigate,
  Outlet,
  useLocation,
} from "@tanstack/react-router";
import { useAuthentication } from "../contexts/authentication";

export const Route = createFileRoute("/_authentication")({
  component: () => {
    const { state } = useAuthentication();
    const { pathname } = useLocation();

    return <Outlet />;
  },
});
