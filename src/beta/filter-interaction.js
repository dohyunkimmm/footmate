export function openQuickFilterIds(root){
 return [...root.querySelectorAll('.fm-beta-quick-filters details[open] > summary[id]')].map(summary=>summary.id);
}
export function restoreQuickFilters(root,ids){
 const open=new Set(ids);
 for(const summary of root.querySelectorAll('.fm-beta-quick-filters summary[id]')){
  if(open.has(summary.id))summary.closest('details').open=true;
 }
}
