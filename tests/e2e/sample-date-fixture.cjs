// Keep sample date copy stable while real match timestamps and clocks keep running.
module.exports=async function sampleDateFixture(page){
  await page.route('**/src/app/data.js*',async route=>{
    const response=await route.fetch();
    const source=await response.text();
    const body=source.replace(
      "const day=new Intl.DateTimeFormat('ko-KR',{month:'long',day:'numeric'}).format(date);",
      "const displayDate=new Date('2026-10-01T12:00:00Z');displayDate.setDate(displayDate.getDate()+offsetDays);const day=new Intl.DateTimeFormat('ko-KR',{month:'long',day:'numeric'}).format(displayDate);"
    ).replace(
      "const weekday=new Intl.DateTimeFormat('ko-KR',{weekday:'short'}).format(date);",
      "const weekday=new Intl.DateTimeFormat('ko-KR',{weekday:'short'}).format(displayDate);"
    );
    await route.fulfill({response,body});
  });
};
