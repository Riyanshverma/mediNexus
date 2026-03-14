export const AdminOverview = () => {
  return (
    <div className="p-8 animate-in fade-in duration-500">
      <h1 className="text-3xl font-light tracking-tight mb-6">Hospital Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-card rounded-xl border p-6">
          <h3 className="text-muted-foreground text-sm font-medium">Today's Appointments</h3>
          <p className="text-3xl font-light mt-2">0</p>
        </div>
        <div className="bg-card rounded-xl border p-6">
          <h3 className="text-muted-foreground text-sm font-medium">Active Doctors</h3>
          <p className="text-3xl font-light mt-2">0</p>
        </div>
        <div className="bg-card rounded-xl border p-6">
          <h3 className="text-muted-foreground text-sm font-medium">Cancellations</h3>
          <p className="text-3xl font-light mt-2">0</p>
        </div>
        <div className="bg-card rounded-xl border p-6">
          <h3 className="text-muted-foreground text-sm font-medium">No-Shows</h3>
          <p className="text-3xl font-light mt-2">0</p>
        </div>
      </div>
      <div className="bg-card rounded-xl border p-12 text-center text-muted-foreground">
        Detailed operational view and upcoming appointments for the week will appear here.
      </div>
    </div>
  )
}