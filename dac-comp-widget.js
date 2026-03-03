/**
 * DAC Compensation Widget (Shadow DOM embed)
 * Math sources:
 * - Personal commission tiers are % of Bonus Revenue (BR)
 * - Override Spread = Your % - Highest % below you (requires QCB)
 * - 5-Level: L1 4% (Certified), L2–L5 2% each (QCB + personally enrolled QCB thresholds)
 */

(function () {
  const mount = document.getElementById("dac-comp-widget");
  if (!mount) return;

  const shadow = mount.attachShadow({ mode: "open" });

  const css = `
    :host { all: initial; }
    .wrap{
      font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji";
      color:#0b1220;
      max-width: 980px;
    }
    .card{
      border:1px solid rgba(12,18,32,.12);
      border-radius: 16px;
      padding: 18px;
      background: #fff;
      box-shadow: 0 10px 30px rgba(12,18,32,.08);
    }
    .top{
      display:flex; gap:14px; align-items:flex-start; justify-content:space-between; flex-wrap:wrap;
      margin-bottom: 12px;
    }
    .title{
      font-size: 16px;
      font-weight: 800;
      letter-spacing: .2px;
      line-height: 1.2;
    }
    .subtitle{
      margin-top: 4px;
      font-size: 12px;
      color: rgba(12,18,32,.7);
      line-height: 1.4;
      max-width: 70ch;
    }

    .grid{
      display:grid;
      grid-template-columns: 1fr;
      gap: 12px;
    }
    @media (min-width: 860px){
      .grid{ grid-template-columns: 1fr 1fr; gap: 14px; }
    }

    .panel{
      border: 1px solid rgba(12,18,32,.10);
      border-radius: 14px;
      padding: 14px;
      background: linear-gradient(180deg, rgba(12,18,32,.02), transparent);
    }
    .panel h3{
      margin:0 0 10px 0;
      font-size: 13px;
      font-weight: 800;
      color:#0b1220;
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap: 10px;
    }
    .pill{
      font-size: 11px;
      padding: 4px 8px;
      border-radius: 999px;
      border: 1px solid rgba(12,18,32,.14);
      color: rgba(12,18,32,.75);
      background: #fff;
      white-space: nowrap;
    }

    .row{
      display:grid;
      grid-template-columns: 1fr;
      gap: 10px;
      margin-bottom: 10px;
    }
    @media (min-width: 520px){
      .row.two{ grid-template-columns: 1fr 1fr; }
      .row.three{ grid-template-columns: 1fr 1fr 1fr; }
    }

    label{
      display:block;
      font-size: 11px;
      font-weight: 700;
      color: rgba(12,18,32,.78);
      margin-bottom: 6px;
    }
    input, select{
      width:100%;
      border:1px solid rgba(12,18,32,.18);
      border-radius: 10px;
      padding: 10px 10px;
      font-size: 13px;
      background: #fff;
      color:#0b1220;
      outline:none;
    }
    input:focus, select:focus{
      border-color: rgba(12,18,32,.35);
      box-shadow: 0 0 0 4px rgba(12,18,32,.08);
    }

    .toggles{
      display:flex; gap: 10px; flex-wrap: wrap;
      margin-top: 6px;
    }
    .check{
      display:flex; gap:8px; align-items:center;
      border:1px solid rgba(12,18,32,.12);
      padding: 8px 10px;
      border-radius: 999px;
      background:#fff;
      cursor:pointer;
      user-select:none;
      font-size: 12px;
      color: rgba(12,18,32,.84);
    }
    .check input{ width:auto; margin:0; }

    .results{
      margin-top: 12px;
      border-top: 1px dashed rgba(12,18,32,.18);
      padding-top: 12px;
      display:grid;
      grid-template-columns: 1fr;
      gap: 10px;
    }
    @media (min-width: 860px){
      .results{ grid-template-columns: 1fr 1fr; }
    }

    .stat{
      border:1px solid rgba(12,18,32,.10);
      border-radius: 14px;
      padding: 12px;
      background: #fff;
    }
    .stat .k{
      font-size: 11px;
      font-weight: 800;
      color: rgba(12,18,32,.65);
      letter-spacing: .2px;
      text-transform: uppercase;
    }
    .stat .v{
      margin-top: 6px;
      font-size: 20px;
      font-weight: 900;
      letter-spacing: -.2px;
    }
    .stat .s{
      margin-top: 6px;
      font-size: 12px;
      color: rgba(12,18,32,.70);
      line-height: 1.4;
    }

    .note{
      margin-top: 12px;
      font-size: 11px;
      color: rgba(12,18,32,.65);
      line-height: 1.45;
    }
    .warn{
      margin-top: 8px;
      font-size: 11px;
      color: rgba(140,45,10,.95);
      line-height: 1.45;
      border-left: 3px solid rgba(140,45,10,.4);
      padding-left: 10px;
    }
    .mini{
      font-variant-numeric: tabular-nums;
    }
  `;

  const html = `
    <div class="wrap">
      <div class="card">
        <div class="top">
          <div>
            <div class="title">DAC Compensation Estimator (Personal + Override Spread + 5-Level)</div>
            <div class="subtitle">
              Payouts are calculated on <b>Bonus Revenue (BR)</b>, not raw funding volume.
              This widget uses a selectable BR rate proxy (1%, 4%, 6%, 8%) to estimate BR from funding volume.
            </div>
          </div>
          <div class="pill">Embed-safe • Shadow DOM</div>
        </div>

        <div class="grid">
          <!-- Personal -->
          <div class="panel">
            <h3>
              Personal Production
              <span class="pill">Personal commission = % × BR</span>
            </h3>

            <div class="row two">
              <div>
                <label for="brRate">BR rate proxy (of funding)</label>
                <select id="brRate">
                  <option value="1">1%</option>
                  <option value="4" selected>4%</option>
                  <option value="6">6%</option>
                  <option value="8">8%</option>
                </select>
              </div>
              <div>
                <label for="yourCommission">Your Personal Commission %</label>
                <select id="yourCommission">
                  <option value="40">40%</option>
                  <option value="45">45%</option>
                  <option value="50">50%</option>
                  <option value="55">55%</option>
                  <option value="60" selected>60%</option>
                  <option value="65">65%</option>
                  <option value="70">70%</option>
                  <option value="75">75%</option>
                  <option value="80">80%</option>
                </select>
              </div>
            </div>

            <div class="row">
              <div>
                <label for="personalFunding">Your estimated monthly funding volume ($)</label>
                <input id="personalFunding" type="number" min="0" step="100" value="50000" />
              </div>
            </div>

            <div class="toggles">
              <label class="check" title="Referral Partners do not earn team income; Certified Brokers do.">
                <input id="isCertified" type="checkbox" checked />
                I am a Certified Broker
              </label>
              <label class="check" title="QCB required to earn overrides; QCB = first 30 days OR $1,000+ personal BR in last 6 months.">
                <input id="isQCB" type="checkbox" checked />
                I am QCB (qualified for overrides)
              </label>
            </div>
          </div>

          <!-- Agency -->
          <div class="panel">
            <h3>
              Agency / Recruiting
              <span class="pill">Override Spread + 5-Level Pay</span>
            </h3>

            <div class="row two">
              <div>
                <label for="numAgents"># of personally enrolled agents (frontline)</label>
                <input id="numAgents" type="number" min="0" step="1" value="5" />
              </div>
              <div>
                <label for="agentFunding">Avg monthly funding per agent ($)</label>
                <input id="agentFunding" type="number" min="0" step="100" value="30000" />
              </div>
            </div>

            <div class="row two">
              <div>
                <label for="agentCommission">Typical agent commission % (highest below you)</label>
                <select id="agentCommission">
                  <option value="40" selected>40%</option>
                  <option value="45">45%</option>
                  <option value="50">50%</option>
                  <option value="55">55%</option>
                  <option value="60">60%</option>
                  <option value="65">65%</option>
                  <option value="70">70%</option>
                  <option value="75">75%</option>
                  <option value="80">80%</option>
                </select>
              </div>
              <div>
                <label for="frontlineQCBs">Personally enrolled active QCBs (for L2–L5 unlock)</label>
                <input id="frontlineQCBs" type="number" min="0" step="1" value="3" />
              </div>
            </div>

            <div class="row">
              <div>
                <label for="extraDownlineFunding">
                  Optional: additional monthly downline funding (excluding your frontline) ($)
                  <span class="mini" style="font-weight:600;color:rgba(12,18,32,.55)">(for deeper L2–L5 team BR)</span>
                </label>
                <input id="extraDownlineFunding" type="number" min="0" step="100" value="0" />
              </div>
            </div>
          </div>
        </div>

        <!-- Results -->
        <div class="results">
          <div class="stat">
            <div class="k">Estimated Personal BR</div>
            <div class="v mini" id="personalBR">$0</div>
            <div class="s">BR = funding × selected BR rate proxy.</div>
          </div>

          <div class="stat">
            <div class="k">Personal Commission (monthly)</div>
            <div class="v mini" id="personalPay">$0</div>
            <div class="s">Personal pay = your commission % × personal BR.</div>
          </div>

          <div class="stat">
            <div class="k">Override Spread (monthly)</div>
            <div class="v mini" id="overridePay">$0</div>
            <div class="s mini" id="overrideDetail">Spread = your % − highest below you; requires QCB.</div>
          </div>

          <div class="stat">
            <div class="k">5-Level Pay (monthly equivalent)</div>
            <div class="v mini" id="fiveLevelPay">$0</div>
            <div class="s mini" id="fiveLevelDetail">
              L1 (4%) on frontline BR if Certified. L2–L5 (2% each) on team BR if QCB + unlocks.
            </div>
          </div>

          <div class="stat">
            <div class="k">Total Estimated Monthly Compensation</div>
            <div class="v mini" id="totalPay">$0</div>
            <div class="s">Personal + Override Spread + 5-Level (monthly equivalent).</div>
          </div>

          <div class="stat">
            <div class="k">Estimated BR Totals (team)</div>
            <div class="v mini" id="teamBR">$0</div>
            <div class="s mini" id="teamBRDetail">Frontline BR + optional deeper downline BR.</div>
          </div>
        </div>

        <div class="note">
          Notes: Override Spread and 5-Level eligibility depends on status (Certified / QCB) and rules.
          This estimator uses your inputs to model the math; it doesn’t validate certification, QCB rolling windows, promotions, timing, or compression depth.
        </div>
        <div class="warn">
          DAC forbids income claims. This is a math estimator only—actual results vary with markets, effort, and funder timing/clawbacks.
        </div>
      </div>
    </div>
  `;

  shadow.innerHTML = `<style>${css}</style>${html}`;

  const $ = (id) => shadow.getElementById(id);

  const money = (n) =>
    (Number(n) || 0).toLocaleString(undefined, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    });

  const pct = (n) => `${(Number(n) || 0).toFixed(2)}%`;

  function numVal(id) {
    return Number($(id).value || 0);
  }
  function boolVal(id) {
    return !!$(id).checked;
  }

  function calcUnlockedLevels(frontlineQCBs, isQCB) {
    // L1 is handled separately (Certified).
    // L2–L5 unlock thresholds:
    // L2: 3 QCB, L3: 6 QCB, L4: 10 QCB, L5: 20 QCB (requires YOU are QCB)
    if (!isQCB) return 0; // unlocked count among L2–L5
    let count = 0;
    if (frontlineQCBs >= 3) count++;
    if (frontlineQCBs >= 6) count++;
    if (frontlineQCBs >= 10) count++;
    if (frontlineQCBs >= 20) count++;
    return count; // 0..4
  }

  function recalc() {
    const brRate = numVal("brRate") / 100;

    const yourCommission = numVal("yourCommission") / 100;
    const agentCommission = numVal("agentCommission") / 100;

    const personalFunding = numVal("personalFunding");
    const numAgents = numVal("numAgents");
    const agentFunding = numVal("agentFunding");
    const extraDownlineFunding = numVal("extraDownlineFunding");

    const isCertified = boolVal("isCertified");
    const isQCB = boolVal("isQCB");

    // --- BR estimates (BR = funding * BR rate proxy) ---
    const personalBR = personalFunding * brRate;

    // Frontline (personally enrolled brokers) BR:
    const frontlineFunding = numAgents * agentFunding;
    const frontlineBR = frontlineFunding * brRate;

    // Optional deeper downline BR:
    const downlineBR = extraDownlineFunding * brRate;

    // Total "team BR" we’ll use for 5-level L2–L5:
    const agencyTeamBR = frontlineBR + downlineBR;

    // --- Personal commission ---
    const personalPay = personalBR * yourCommission;

    // --- Override Spread (requires QCB) ---
    const spreadPct = Math.max(yourCommission - agentCommission, 0);
    const overridePay = isQCB ? frontlineBR * spreadPct : 0;

    // --- 5-Level Pay ---
    // L1: 4% of BR from personally enrolled brokers (Certified Broker required; Referral Partners do not earn teams income)
    const level1Pay = isCertified ? frontlineBR * 0.04 : 0;

    // L2–L5: 2% each of the BR from your agency team (requires YOU are QCB + thresholds of personally enrolled QCBs)
    const frontlineQCBs = numVal("frontlineQCBs");
    const unlockedL2toL5 = calcUnlockedLevels(frontlineQCBs, isQCB);
    const l2toL5Pay = agencyTeamBR * (0.02 * unlockedL2toL5);

    const fiveLevelPay = level1Pay + l2toL5Pay;

    // Total monthly estimate
    const total = personalPay + overridePay + fiveLevelPay;

    // --- UI ---
    $("personalBR").textContent = money(personalBR);
    $("personalPay").textContent = money(personalPay);

    $("teamBR").textContent = money(agencyTeamBR);
    $("teamBRDetail").textContent =
      `Frontline BR ${money(frontlineBR)} + deeper downline BR ${money(downlineBR)} = ${money(agencyTeamBR)}.`;

    $("overridePay").textContent = money(overridePay);
    $("overrideDetail").textContent = isQCB
      ? `Spread = ${pct(spreadPct * 100)} (your ${pct(yourCommission * 100)} − agent ${pct(agentCommission * 100)}) × frontline BR ${money(frontlineBR)}.`
      : `You’re not marked QCB → Override Spread = $0.`;

    const unlockedText = isQCB
      ? `Unlocked L2–L5: ${unlockedL2toL5}/4 (based on ${frontlineQCBs} personally enrolled active QCBs).`
      : `Not QCB → L2–L5 locked.`;

    $("fiveLevelPay").textContent = money(fiveLevelPay);
    $("fiveLevelDetail").textContent =
      `L1: ${isCertified ? "4% × frontline BR" : "locked (not Certified)"} = ${money(level1Pay)}. ` +
      `L2–L5: ${unlockedText} Pay = ${money(l2toL5Pay)} on team BR ${money(agencyTeamBR)}.`;

    $("totalPay").textContent = money(total);
  }

  // Bind events
  [
    "brRate",
    "yourCommission",
    "personalFunding",
    "isCertified",
    "isQCB",
    "numAgents",
    "agentFunding",
    "agentCommission",
    "frontlineQCBs",
    "extraDownlineFunding",
  ].forEach((id) => {
    const el = $(id);
    if (!el) return;
    el.addEventListener("input", recalc);
    el.addEventListener("change", recalc);
  });

  recalc();
})();