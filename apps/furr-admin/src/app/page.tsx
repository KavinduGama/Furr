export default function AdminOverview() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-[#02202B] tracking-tight">Overview</h1>
        <p className="text-stone-500 mt-1">Platform health and high-level metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
          <p className="text-sm font-bold text-stone-500 uppercase tracking-wider">Active Users</p>
          <p className="text-3xl font-black text-[#02202B] mt-2">1,248</p>
          <p className="text-xs text-[#62A48C] font-bold mt-2">+12% this week</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
          <p className="text-sm font-bold text-stone-500 uppercase tracking-wider">Verified Vets</p>
          <p className="text-3xl font-black text-[#02202B] mt-2">42</p>
          <p className="text-xs text-[#E65100] font-bold mt-2">4 Pending Review</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
          <p className="text-sm font-bold text-stone-500 uppercase tracking-wider">Total Pets</p>
          <p className="text-3xl font-black text-[#02202B] mt-2">1,890</p>
          <p className="text-xs text-[#62A48C] font-bold mt-2">+8% this week</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm border-l-4 border-l-[#E65100]">
          <p className="text-sm font-bold text-stone-500 uppercase tracking-wider">System Alerts</p>
          <p className="text-3xl font-black text-[#E65100] mt-2">1</p>
          <p className="text-xs text-stone-500 mt-2">SMS Delivery Delay</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6">
           <h3 className="font-bold text-[#02202B] mb-4">Recent Audit Logs</h3>
           <div className="space-y-4">
              <div className="flex justify-between items-center text-sm border-b border-stone-100 pb-3">
                 <div>
                   <p className="font-bold text-stone-700">Vet Approved (VET-9821)</p>
                   <p className="text-stone-400 text-xs">By Admin 88A9F</p>
                 </div>
                 <span className="text-stone-400 text-xs">2m ago</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-stone-100 pb-3">
                 <div>
                   <p className="font-bold text-stone-700">User Account Suspended</p>
                   <p className="text-stone-400 text-xs">System Automation</p>
                 </div>
                 <span className="text-stone-400 text-xs">1hr ago</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
