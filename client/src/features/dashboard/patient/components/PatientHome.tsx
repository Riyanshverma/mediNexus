const PatientHome = () => {
  return (
    <div className="p-8 animate-in fade-in duration-500">
      <h1 className="text-3xl font-light tracking-tight mb-6">Welcome Back</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Placeholder Data Cards */}
        <div className="bg-card rounded-xl border p-6">
          <h3 className="text-muted-foreground text-sm font-medium">Upcoming Appointments</h3>
          <p className="text-3xl font-light mt-2">2</p>
        </div>
      </div>
    </div>
  )
}

export default PatientHome;