import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

function dashboard(){
  const html=readFileSync(new URL('./index.html',import.meta.url),'utf8');
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  const elements=new Map(ids.map(id=>[id,{value:id==='page-size'?'10':'',innerHTML:'',textContent:'',disabled:false}]));
  const context=vm.createContext({document:{querySelector:selector=>elements.get(selector.slice(1))},Intl,URL,Blob,setTimeout});
  vm.runInContext(html.match(/<script>([\s\S]*?)<\/script>/)[1],context);
  const rows=()=>[...elements.get('metrics').innerHTML.matchAll(/<tr(?:\s|>)/g)].length;
  return {context,elements,rows};
}

test('latest metrics start at ten rows with correct boundaries',()=>{
  const d=dashboard();
  assert.equal(d.elements.get('date').value,'2026-10-27');
  assert.equal(d.rows(),10);
  assert.match(d.elements.get('page-summary').textContent,/120/);
  assert.equal(d.elements.get('page-prev').disabled,true);
  assert.equal(d.elements.get('page-next').disabled,false);
});

test('page navigation reaches last record without changing source data',()=>{
  const d=dashboard();
  const initial=vm.runInContext('JSON.stringify(DATA)',d.context);
  d.elements.get('page-next').onclick();
  assert.match(d.elements.get('page-current').textContent,/2\s*\/\s*12/);
  d.elements.get('page-last').onclick();
  assert.match(d.elements.get('page-current').textContent,/12\s*\/\s*12/);
  assert.equal(d.rows(),10);
  assert.equal(d.elements.get('page-next').disabled,true);
  d.elements.get('page-prev').onclick();
  assert.match(d.elements.get('page-current').textContent,/11\s*\/\s*12/);
  d.elements.get('page-first').onclick();
  assert.equal(d.elements.get('page-prev').disabled,true);
  assert.equal(vm.runInContext('JSON.stringify(DATA)',d.context),initial);
});

test('fifteen rows per page resets position and paginates all matching metrics',()=>{
  const d=dashboard();
  d.elements.get('page-last').onclick();
  d.elements.get('page-size').value='15';
  d.elements.get('page-size').onchange();
  assert.equal(d.rows(),15);
  assert.match(d.elements.get('page-current').textContent,/1\s*\/\s*8/);
  d.elements.get('page-last').onclick();
  assert.equal(d.rows(),15);
  assert.match(d.elements.get('page-summary').textContent,/106.*120/);
});

test('search resets page, paginates filtered records and handles empty matches',()=>{
  const d=dashboard();
  d.elements.get('page-last').onclick();
  d.elements.get('search').value='youtube';
  d.elements.get('search').oninput();
  assert.equal(d.rows(),10);
  assert.match(d.elements.get('page-current').textContent,/^1\s*\//);
  assert.ok(!d.elements.get('metrics').innerHTML.includes('instagram /'));
  d.elements.get('search').value='not-a-metric-123456';
  d.elements.get('search').oninput();
  assert.match(d.elements.get('metrics').innerHTML,/검색 결과가 없습니다/);
  assert.equal(d.elements.get('page-next').disabled,true);
  assert.equal(d.elements.get('page-prev').disabled,true);
  assert.match(d.elements.get('page-current').textContent,/0\s*\/\s*0/);
});

test('changing observation date resets pagination while retaining filters',()=>{
  const d=dashboard();
  d.elements.get('page-last').onclick();
  d.elements.get('date').value='2026-10-24';
  d.elements.get('date').onchange();
  assert.equal(d.rows(),10);
  assert.match(d.elements.get('page-current').textContent,/^1\s*\//);
  assert.match(d.elements.get('updated').textContent,/2026-10-24/);
});

test('numbered pages stay centered with five choices and shift at either boundary',()=>{
  const d=dashboard();
  const numbers=()=>[...d.elements.get('page-numbers').innerHTML.matchAll(/data-page="(\d+)"/g)].map(m=>+m[1]);
  assert.deepEqual(numbers(),[1,2,3,4,5]);
  vm.runInContext('metricsPage=6;rows()',d.context);
  assert.deepEqual(numbers(),[4,5,6,7,8]);
  assert.match(d.elements.get('page-numbers').innerHTML,/data-page="6"[^>]*aria-current="page"/);
  d.elements.get('page-last').onclick();
  assert.deepEqual(numbers(),[8,9,10,11,12]);
});

test('a numbered button jumps to its page and recenters the available choices',()=>{
  const d=dashboard();
  d.elements.get('page-numbers').onclick({target:{closest:()=>({dataset:{page:'5'}})}});
  assert.match(d.elements.get('page-current').textContent,/5\s*\/\s*12/);
  assert.match(d.elements.get('page-summary').textContent,/41.*50/);
  const numbers=[...d.elements.get('page-numbers').innerHTML.matchAll(/data-page="(\d+)"/g)].map(m=>+m[1]);
  assert.deepEqual(numbers,[3,4,5,6,7]);
  d.elements.get('search').value='not-a-metric-123456';d.elements.get('search').oninput();
  assert.equal(d.elements.get('page-numbers').innerHTML,'');
});

test('all published observations and metrics exactly match the verified JSON files',()=>{
  const d=dashboard();
  const snapshots=JSON.parse(vm.runInContext('JSON.stringify(DATA)',d.context));
  for(const snapshot of snapshots){
    const file=JSON.parse(readFileSync(new URL('./sns-data-'+snapshot.observed_date_kst+'.json',import.meta.url),'utf8'));
    assert.deepEqual(snapshot,file,snapshot.observed_date_kst);
    assert.ok(snapshot.metrics.every(m=>typeof m.source_url==='string'&&m.source_url.startsWith('https://')));
  }
});
