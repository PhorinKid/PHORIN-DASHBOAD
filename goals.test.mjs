import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import vm from 'node:vm';

const root=new URL('./',import.meta.url);
function dashboard(){const html=readFileSync(new URL('index.html',root),'utf8');const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);const elements=new Map(ids.map(id=>[id,{value:id==='page-size'?'10':'',innerHTML:'',textContent:'',disabled:false}]));const ctx=vm.createContext({document:{querySelector:s=>elements.get(s.slice(1))},Intl,URL,Blob,setTimeout});vm.runInContext(html.match(/<script>([\s\S]*?)<\/script>/)[1],ctx);return {ctx,elements};}
test('published goals use the committed real snapshot baselines and preserve aggregation periods',()=>{
  const goals=JSON.parse(readFileSync(new URL('kpi-goals.json',root),'utf8'));
  const snapshot=JSON.parse(readFileSync(new URL('sns-data-'+goals.baseline_date+'.json',root),'utf8'));
  assert.equal(goals.review_date,'2026-11-03');assert.equal(goals.deadline,'2026-11-24');
  assert.equal(goals.goals.length,5);
  for(const g of goals.goals){const observed=snapshot.metrics.find(m=>m.platform===g.platform&&m.scope===g.scope&&m.metric===g.metric&&m.aggregation===g.aggregation&&(!g.entity_id||m.entity_id===g.entity_id));assert.ok(observed,g.id);assert.equal(g.baseline,observed.value,g.id);assert.ok(g.target>g.baseline);}
});
test('dashboard keeps the goal baseline fixed while browsing historical observations',()=>{
  const d=dashboard(),initial=d.elements.get('goals-body').innerHTML;
  assert.match(initial,/250/);assert.match(initial,/260/);assert.match(initial,/50/);
  d.elements.get('date').value='2026-10-23';d.elements.get('date').onchange();
  assert.equal(d.elements.get('goals-body').innerHTML,initial);
});
test('unavailable new measurements cannot be presented as zero or completion',()=>{
  const d=dashboard();
  assert.equal(vm.runInContext('findGoalObservation({metrics:[]},GOALS.goals[0])',d.ctx),null);
  assert.match(d.elements.get('goals-body').innerHTML,/추가 관측 대기/);
});
test('legacy dummy assets and rebuilding entry points are absent',()=>{
  for(const file of ['sample-data.csv','dist/thumbnail-data.mjs','thumbnail-preview.png','deployed-dashboard-proof.png','dist/thumbnails/sea.jpg'])assert.equal(existsSync(new URL(file,root)),false,file);
  assert.ok(!readFileSync(new URL('dist/app.mjs',root),'utf8').includes('sampleWeek'));
  assert.ok(!readFileSync(new URL('dist/socialpulse.html',root),'utf8').includes('const DATA'));
  const pkg=JSON.parse(readFileSync(new URL('package.json',root),'utf8'));assert.equal(pkg.scripts.build,undefined);
  assert.ok(!readFileSync(new URL('server.mjs',root),'utf8').includes("resolve('dist')"));
});
