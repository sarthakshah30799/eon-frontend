export const Loader = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin mx-auto mb-4 h-8 w-8 rounded-full border-b-2 border-primary-500"></div>
        <p className="text-text-secondary">Loading...</p>
      </div>
    </div>
  );
};
