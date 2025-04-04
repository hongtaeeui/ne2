import { LoginForm } from "@/components/login-form";

export default function Page() {
  return (
    <div
      className="flex min-h-svh w-full items-center justify-center "
      style={{
        backgroundImage: 'url("/bg/login-bg.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
