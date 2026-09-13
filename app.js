'use strict';
(() => {
  const $ = (selector) => document.querySelector(selector);
  const escape = (value) => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  // Never render private paths, financial identifiers, or individual provider names.
  const excluded = new Set(['invoice','invoice_id','provider','providers_documented','services_and_providers','radiologist','text_extracts','microchipOnFile','recordName']);
  const isSource = key => /source_files?$|corroborating_source_files/.test(key);
  const labels = {as_of:'Documented as of',dobStatus:'Date of birth uncertainty',dobRecords:'Birth dates as recorded',date_confirmed:'Food documented on',currentFood:'Food photo / earlier record',vetInstructions:'Veterinary instructions',weight_kg:'Weight (kg)',weight_lb:'Weight (lb)',temperature_f:'Temperature (°F)',temperature_f_recorded:'Recorded temperatures (°F)',heart_rate_bpm:'Heart rate (bpm)',respiratory_rate_bpm:'Respiratory rate (breaths/min)',wbc_k_per_uL:'WBC (K/µL)',neutrophils_k_per_uL:'Neutrophils (K/µL)',monocytes_k_per_uL:'Monocytes (K/µL)',platelets_k_per_uL:'Platelets (K/µL)',hct_percent:'HCT (%)',hematocrit_percent:'Hematocrit (%)',hgb_g_per_dL:'Hgb (g/dL)',mpv_fL:'MPV (fL)',total_bilirubin_mg_per_dL:'Total bilirubin (mg/dL)',alp_u_per_L:'ALP (U/L)',alt_u_per_L:'ALT (U/L)',ggt_u_per_L:'GGT (U/L)',globulin_g_per_dL:'Globulin (g/dL)',cholesterol_mg_per_dL:'Cholesterol (mg/dL)',creatinine_mg_per_dL:'Creatinine (mg/dL)',bun_mg_per_dL:'BUN (mg/dL)',protein_mg_per_dL:'Protein (mg/dL)',rbc_cells_per_uL:'RBC (cells/µL)',nucleated_cells_per_uL:'Nucleated cells (cells/µL)',dimensions_cm:'Dimensions (cm)',hpi:'Owner-provided illness history'};
  const label = key => labels[key] || key.replace(/([a-z])([A-Z])/g,'$1 $2').replaceAll('_',' ').replace(/^./,c=>c.toUpperCase());
  const uncertain = key => /limit|uncertain|reconciliation|precaution|evidence|precedence|dobStatus/.test(key);
  const sourceNames = {
    '2026-06-19_spay-certificate.pdf':'Spay / alteration certificate · 2026-06-19',
    '2026-06-22_pv-village-pet-hospital-visit-summary.pdf':'PV Village puppy visit summary · 2026-06-22',
    '2026-08-17_pv-village-immunizations-page-1.heic':'PV Village immunization report (photographed page) · 2026-08-17',
    '2026-08-31_pv-village-immunizations.pdf':'PV Village immunization report (PDF) · 2026-08-31',
    '2026-09-05_veg-torrance-emergency-visit-medical-record.pdf':'VEG Torrance emergency medical record · 2026-09-05',
    '2026-09-05_veg-torrance-emergency-visit-invoice.pdf':'VEG Torrance invoice (not published) · 2026-09-05',
    '2026-09-06_veg-torrance-hospitalization-record.pdf':'VEG Torrance hospitalization record · 2026-09-06',
    '2026-09-07_access-culver-city-specialty-record.pdf':'ACCESS Culver City specialty record · 2026-09-07',
    '2026-09-08_vsr2744_mri-radiology-report.pdf':'MRI radiology report · 2026-09-08',
    '2026-09-10_fuo-pcr-panel.pdf':'FUO PCR panel · 2026-09-10',
    '2026-09-11_pv-village-follow-up-visit-summary.pdf':'PV Village follow-up visit summary · 2026-09-11',
    '2026-09-07_owner-current-illness-hpi.md':'Owner-provided current-illness history · 2026-09-07'
  };
  function sourceLabel(path) { return sourceNames[path.split('/').pop()] || 'Private source; label not supplied'; }
  function valueHTML(value) {
    if (Array.isArray(value)) return '<ul>'+value.map(v=>'<li>'+valueHTML(v)+'</li>').join('')+'</ul>';
    if (value && typeof value === 'object') return fields(value);
    return escape(typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value ?? 'Not supplied');
  }
  const vDefined = value => value !== undefined;
  function fields(obj, omit=[]) {
    return '<dl class="fields">'+Object.entries(obj).filter(([k])=>!excluded.has(k)&&!omit.includes(k)&&vDefined(obj[k])).map(([k,v])=>{
      if(isSource(k)) return '<div class="field"><dt>'+escape(k.startsWith('corroborating')?'Corroborating source':'Source')+'</dt><dd>'+[v].flat().map(sourceLabel).map(escape).join('<br>')+'</dd></div>';
      const group=v && typeof v==='object' && !Array.isArray(v);
      return '<div class="field'+(group?' group':'')+(uncertain(k)?' uncertainty':'')+'"><dt>'+escape(label(k))+'</dt><dd>'+valueHTML(v)+'</dd></div>';
    }).join('')+'</dl>';
  }
  const dateOf = row => row.date || row.study_date || row.result_date || row.visit_datetime || row.visit_start || row.admission_datetime || row.start_date || row.reported_at || row.recorded_at || row.collection_date || (row.recorded_span ? row.recorded_span.slice(0,10) : '');
  const latest = rows => [...rows].sort((a,b)=>dateOf(b).localeCompare(dateOf(a)));
  function provenance(row) {
    const paths=[row.source_file,...(row.source_files||[])].filter(Boolean);
    return '<p class="provenance">'+(paths.length?paths.map(p=>'<span>Source: '+escape(sourceLabel(p))+'</span>').join(''):'Source: derived structured record; individual source attribution is not supplied for this entry.')+'</p>';
  }
  function record(title,row,{summary='',evidence='Structured record entry',extra='',open=false}={}) {
    const date=dateOf(row);
    return '<article class="record"><div class="record-head"><h3>'+escape(title)+'</h3>'+(date?'<time>'+escape(date)+'</time>':'')+'</div><p class="evidence">'+escape(row.evidence_status||row.evidenceLevel||evidence)+'</p>'+(summary?'<p class="lede">'+escape(summary)+'</p>':'')+extra+'<details'+(open?' open':'')+'><summary>Full record details</summary>'+fields(row)+'</details>'+provenance(row)+'</article>';
  }
  const sectionDefs=[['overview','Overview'],['timeline','Timeline'],['encounters','Encounters'],['diagnostics','Diagnostics & labs'],['medications','Medications'],['preventives','Vaccines & preventives'],['weight','Weight trend'],['owner','Owner updates'],['diet','Diet'],['sources','Source inventory']];
  function section(id,title,note,html) {return '<section id="'+id+'"'+(id==='timeline'?' class="timeline"':'')+'><header><h2>'+title+'</h2><p class="section-note">'+note+'</p></header>'+html+'</section>';}
  function overview(d) {
    const s=d.currentStatus;
    return '<div class="overview-grid">'+
      '<article class="record status"><div class="record-head"><h3>Current documented status</h3><time>'+escape(s.as_of)+'</time></div><p class="lede">'+escape(s.summary)+'</p><p class="evidence">Clinician-documented follow-up · Snapshot, not a live status</p>'+provenance(s)+'</article>'+
      '<article class="record"><h3>Key abnormalities</h3>'+valueHTML(s.important_abnormalities)+provenance(s)+'</article>'+
      '<article class="record"><h3>Open follow-up items</h3>'+valueHTML(s.open_items)+provenance(s)+'</article>'+
      '<article class="record precautions"><h3>Return precautions</h3><p>Documented reasons for veterinary re-evaluation</p>'+valueHTML(d.returnPrecautions)+provenance(d.hospitalizations[1])+'</article>'+
      '<article class="record"><h3>Record context & uncertainty</h3><p class="uncertainty">'+escape(d.subject.dobStatus)+'</p><p>Allergies: '+escape(d.subject.allergies)+' (record wording).</p><details><summary>Subject details & conflicting birth dates</summary>'+fields(d.subject)+fields({dataset_updated:d.lastUpdated,privacy_notice:d.privacyNotice,notes:d.notes})+'</details><p class="provenance">Dates and source conflicts are preserved without reconciliation.</p></article></div>';
  }
  function weights(d) {
    const rows=d.weights.map(r=>({...r,series_source:'Dedicated weight history'}));
    for(const r of [...d.emergencyVisits,...d.hospitalizations,...d.followUpVisits]) {
      const vs=Array.isArray(r.vitals)?r.vitals:[r.vitals];
      for(const v of vs.filter(Boolean)) if(v.weight_kg && !rows.some(w=>w.date===dateOf(r).slice(0,10)&&w.weight_kg===v.weight_kg)) rows.push({date:dateOf(r).slice(0,10),weight_kg:v.weight_kg,context:v.context||r.facility,source_file:r.source_file,series_source:'Encounter vitals; date is the encounter date, measurement timestamp not separately supplied'});
    }
    rows.sort((a,b)=>a.date.localeCompare(b.date));
    // All chart bars use kilograms; pounds-only entries are explicitly converted for the chart.
    const chart='<article class="record"><h3>Recorded weights over time</h3><div class="weight-chart" role="img" aria-label="Weight in kilograms by record date. Exact values, source context and carried-forward limitations are in the entries below.">'+rows.map((r,i)=>{const kg=r.weight_kg??r.weight_lb*0.45359237;return '<div class="weight-point'+(r.date==='2026-08-31'?' carried':'')+'"><span>'+kg.toFixed(2)+'</span><div class="bar" data-height="'+(kg/5*100)+'"></div><small>'+escape(r.date)+'</small></div>';}).join('')+'</div><p class="provenance">Chart: kg, zero baseline. Pounds-only values converted using 1 lb = 0.45359237 kg; labels rounded to two decimals. Striped 2026-08-31 bar may be carried forward. Multiple encounter weights retain their separate contexts.</p></article>';
    return chart+latest(rows).map(r=>record((r.weight_kg!=null?r.weight_kg+' kg':'')+(r.weight_lb!=null?(r.weight_kg!=null?' / ':'')+r.weight_lb+' lb':''),r,{summary:r.context,open:true})).join('');
  }
  function render(d) {
    $('#subject').textContent=[d.subject.breed,d.subject.sexStatus].join(' · ');
    $('#freshness').innerHTML='<strong>Status documented '+escape(d.currentStatus.as_of)+'</strong><span>Dataset updated '+escape(d.lastUpdated)+'</span><br><span>No later clinical status supplied.</span>';
    $('#navigation').innerHTML=sectionDefs.map(([id,name],i)=>'<a href="#'+id+'"'+(i===0?' aria-current="location"':'')+'><span class="nav-number" aria-hidden="true">'+String(i+1).padStart(2,'0')+'</span>'+name+'</a>').join('');
    const encounters=latest([...d.emergencyVisits,...d.hospitalizations,...d.followUpVisits]);
    const diagnostics=[...latest(d.laboratoryResults).map(r=>record(r.context,r,{summary:r.source_interpretation,evidence:'Clinician / laboratory record'})),...latest(d.diagnosticTests).map(r=>record(r.test,r,{summary:r.overall_result||r.result,evidence:'Laboratory result',extra:r.interpretation_limit?'<p class="uncertainty">'+escape(r.interpretation_limit)+'</p>':''})),...latest(d.diagnosticImaging).map(r=>record(r.study_description,r,{summary:r.interpretation||r.record_interpretation||'',evidence:'Imaging report'})),...encounters.filter(r=>r.diagnostics).map(r=>record('Encounter diagnostics · '+r.facility,{date:dateOf(r),diagnostics:r.diagnostics,source_file:r.source_file,source_files:r.source_files},{evidence:'Diagnostics as documented in encounter'}))].join('');
    $('#records').innerHTML=section('overview','At a glance','Latest clinical documentation first. Findings and plans below retain the wording of the derived record.',overview(d))+
    section('timeline','Timeline','Newest first · Event dates do not establish a causal relationship.',latest(d.timeline).map(r=>record(r.title,r,{summary:r.summary,evidence:r.evidenceLevel||'Derived timeline summary'})).join(''))+
    section('encounters','Encounters','Emergency care, hospitalization, specialty workup and follow-up. Historical inpatient treatments are not a current medication list.',encounters.map(r=>record(r.episode||r.facility,r,{summary:r.reason||r.reason_for_return||r.reason_for_transfer||r.history_summary,evidence:'Clinical encounter record'})).join(''))+
    section('diagnostics','Diagnostics, labs & imaging','Exact reported values and source qualifications. Negative tests retain their limitations; no new reference ranges or interpretations are added.',diagnostics)+
    section('medications','Medications','Latest documentation first. Prescriptions and historical instructions do not confirm current administration; the exact last carprofen dose is not supplied.',latest(d.medications).map(r=>record(r.item,r,{summary:r.instructions,evidence:'Prescription / documented plan',extra:r.precautions?'<p class="uncertainty">'+escape(r.precautions)+'</p>':''})).join(''))+
    section('preventives','Vaccines & preventives','Administration records and historical plans are kept separate. Listed due dates are source dates, not confirmation of a completed dose.',latest(d.vaccines).map(r=>record(r.item,r,{summary:r.detail||r.status||'',evidence:r.status||'Vaccine / preventive record'})).join('')+'<h3>Preventive schedule as recorded</h3>'+d.preventiveSchedule.map(r=>record(r.items.join(' · '),r,{summary:r.status||'No completion status supplied',evidence:'Historical schedule; verify administration'})).join(''))+
    section('weight','Weight trend','History and encounter vitals, with exact original values. A report date may not represent a new measurement.',weights(d))+
    section('owner','Owner-reported updates','Observations and relayed information are distinct from signed examination findings.',latest(d.ownerReportedUpdates).map(r=>record('Owner update',r,{summary:r.status||'',evidence:'Owner-reported; not independently verified',open:true})).join(''))+
    section('diet','Diet','The earlier food photo and later emergency history differ. “Current food” is the dataset field name, not a confirmation of today’s diet.',record('Food records & veterinary instructions',d.diet,{evidence:'Food photo, clinical history and recorded instructions',open:true}))+
    section('sources','Source inventory','Inventory only. Raw documents remain private and are not linked. Some entries lack item-level attribution in the derived data.',d.sourceFiles.map(r=>'<article class="record"><div class="record-head"><h3>'+escape(r.label)+'</h3><time>'+escape(r.date)+'</time></div><p class="provenance">Private source · inventory entry only</p></article>').join(''));
    // Set chart geometry via a local CSSOM rule so the CSP needs no inline-style allowance.
    const sheet=document.styleSheets[0];
    document.querySelectorAll('[data-height]').forEach((bar,i)=>{bar.classList.add('bar-'+i);sheet.insertRule('.bar-'+i+'{height:'+Number(bar.dataset.height)+'%}',sheet.cssRules.length);});
    $('#footer').innerHTML='<p>'+escape(d.privacyNotice)+'</p>'+d.notes.map(n=>'<p>'+escape(n)+'</p>').join('');
  }
  function setupSearch() {
    const smallScreen = matchMedia('(max-width: 640px)');
    const setMenu = () => { $('#section-menu').open = !smallScreen.matches; };
    setMenu(); smallScreen.addEventListener('change', setMenu);
    const normalize=t=>t.normalize('NFKC').toLocaleLowerCase().replace(/[–—]/g,'-');
    const entries=[...document.querySelectorAll('.record')].map(node=>({node,text:normalize(node.textContent),details:[...node.querySelectorAll('details')].map(el=>({el,open:el.open}))}));
    let searching=false;
    function apply(updateURL=true) {
      const query=$('#query').value.trim();const terms=normalize(query).split(/\s+/).filter(Boolean);
      if(terms.length&&!searching) entries.forEach(e=>e.details.forEach(d=>d.open=d.el.open));
      let count=0;
      for(const entry of entries) {const match=terms.every(t=>entry.text.includes(t));entry.node.hidden=!match;if(match) count++;entry.details.forEach(d=>{d.el.open=terms.length&&match?true:d.open;});}
      for(const section of document.querySelectorAll('#records section')) section.hidden=![...section.querySelectorAll('.record')].some(r=>!r.hidden);
      searching=!!terms.length;
      $('#search-status').textContent=terms.length?count+' matching entries · All words matched across full details and source labels.':'Search all entries, including full details, exact values, dates and source labels.';
      $('#empty').hidden=count!==0;
      if(updateURL) {const url=new URL(location.href);query?url.searchParams.set('q',query):url.searchParams.delete('q');history.replaceState(null,'',url);}
    }
    $('#query').value=new URL(location.href).searchParams.get('q')||'';
    $('#query').addEventListener('input',()=>apply());
    $('#clear').addEventListener('click',()=>{$('#query').value='';apply();$('#query').focus();});
    $('#search-form').addEventListener('submit',e=>{e.preventDefault();apply();});
    addEventListener('popstate',()=>{$('#query').value=new URL(location.href).searchParams.get('q')||'';apply(false);});
    $('#navigation').addEventListener('click',e=>{const link=e.target.closest('a');if(!link)return; if(searching){$('#query').value='';apply();}document.querySelectorAll('nav a').forEach(a=>a.removeAttribute('aria-current'));link.setAttribute('aria-current','location');});
    apply(false);
  }
  fetch('data/frankie.json').then(r=>{if(!r.ok)throw Error('Record request failed');return r.json();}).then(d=>{if(d.schemaVersion!==1)throw Error('Unsupported record schema');render(d);setupSearch();}).catch(()=>{$('#error').hidden=false;$('#error').textContent='The derived record could not be loaded. Serve this folder with a local HTTP server and reload the page. If it is already served, check that data/frankie.json is present and valid.';$('#search-status').textContent='Record unavailable';$('#query').disabled=true;$('#clear').disabled=true;});
})();
