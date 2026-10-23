import test from 'node:test';
import assert from 'node:assert/strict';
import {aggregate, filterDays, recommend, csv} from './dist/core.mjs';
const rows=[{date:'2026-10-23',channel:'ig',postId:'a',views:10,saves:2,reposts:1,shares:3,comments:4,followers:100},{date:'2026-10-23',channel:'ig',postId:'a',views:10,saves:2,reposts:1,shares:3,comments:4,followers:100},{date:'2026-10-22',channel:'ig',postId:'a',views:20,saves:0,reposts:0,shares:0,comments:1,followers:99}];
test('duplicate daily observations do not inflate views or unique posts',()=>{const a=aggregate(rows);assert.equal(a.views,30);assert.equal(a.posts,1);assert.equal(a.conversions,6);assert.equal(a.followers,100);});
test('one day includes only anchor date',()=>assert.equal(filterDays(rows,1,'2026-10-23').length,2));
test('recommend uses completed weekly average and rounds upward',()=>assert.equal(recommend([8000,9000,10000,11000]),10500));
test('CSV escapes commas, quotes and spreadsheet formulas',()=>{const s=csv([{a:'a,"b',b:'=1+1'}]);assert.ok(s.includes('"a,""b"'));assert.ok(s.includes("'=1+1"));});
