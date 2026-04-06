export function initDevTools(currentPlanConfig) {
    // Buat elemen panel jika belum ada
    if (document.getElementById('dev-panel')) return;

    const devDiv = document.createElement('div');
    devDiv.id = 'dev-panel';
    devDiv.className = 'fixed bottom-4 right-4 z-[999] bg-red-950/90 text-white p-3 rounded-2xl shadow-2xl border border-red-500/50 backdrop-blur-md text-[10px] font-mono w-40';
    devDiv.innerHTML = `
        <div class="font-bold mb-2 text-red-400 flex justify-between uppercase tracking-tighter">
            <span>🛠️ Dev Panel</span>
            <button onclick="this.parentElement.parentElement.remove()">✕</button>
        </div>
        <div class="grid grid-cols-2 gap-1 mb-2">
            <button id="dev-basic" class="bg-black/50 p-1 rounded hover:bg-white/10 border border-white/5">BASIC</button>
            <button id="dev-pro" class="bg-black/50 p-1 rounded hover:bg-white/10 border border-white/5">PRO</button>
            <button id="dev-prem" class="bg-black/50 p-1 rounded hover:bg-white/10 border border-white/5">PREM</button>
            <button id="dev-legend" class="bg-yellow-600/50 p-1 rounded hover:bg-yellow-500 border border-yellow-500 text-yellow-100 font-bold">LGD</button>
        </div>
        <div class="opacity-50 text-[8px] leading-tight">
            User: dev_user_001<br>
            Plan: <span id="dev-status-text" class="text-white font-bold">${currentPlanConfig.planName}</span>
        </div>
    `;
    document.body.appendChild(devDiv);

    // Fungsi pembantu untuk tukar pelan
    const updatePlan = (planName) => {
        localStorage.setItem('ketick_plan', planName);
        alert(`🛠️ DEV: Pelan ditukar ke ${planName}. Sistem akan dimuat semula.`);
        window.location.reload();
    };

    document.getElementById('dev-basic').onclick = () => updatePlan('BASIC');
    document.getElementById('dev-pro').onclick = () => updatePlan('PRO');
    document.getElementById('dev-prem').onclick = () => updatePlan('PREMIUM');
    document.getElementById('dev-legend').onclick = () => updatePlan('LEGEND');
}
