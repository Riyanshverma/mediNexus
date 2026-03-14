const DoctorQueue = () => {
  return (
    <div className="p-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-light tracking-tight">Today's Queue</h1>
        <span className="text-sm text-muted-foreground">0 appointments</span>
      </div>
      <div className="bg-card rounded-xl border p-12 text-center text-muted-foreground">
        Your daily patient queue will appear here. Patients marked as "Waiting" will show up first.
      </div>
    </div>
  )
}

export default DoctorQueue;