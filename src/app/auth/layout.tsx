const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg- flex h-screen flex-col items-center justify-center">
      {children}
    </div>
  );
};

export default AuthLayout;
