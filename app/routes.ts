import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("signup", "auth/signup.tsx"),
  route("login", "auth/login.tsx"),
  layout("routes/auth.tsx", [
    route("project/:id", "routes/project.tsx"),
  ]),
] satisfies RouteConfig;