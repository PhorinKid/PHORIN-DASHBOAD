# PHORIN SNS 실측 대시보드

공개 진입점: index.html (GitHub Pages main/root).

매일 관측한 실제 수치를 날짜별 sns-data-YYYY-MM-DD.json으로 보관합니다. 누적·기간 수치와 당일 실적을 구분하며 미제공은 null입니다. 공식 API 실시간 연동은 없습니다.

2026-10-23 원본 기록을 보존하고 2026-10-24 수집 데이터를 추가했습니다. 기존 dist/ 및 sample-data.csv는 레거시 임의 데모입니다. npm run build는 레거시 화면으로 루트 index.html을 덮어쓸 수 있으므로 실측 공개 화면 배포에 사용하지 마세요.

대시보드에서 날짜 선택, 콘텐츠 관측값, 전체 출처, JSON 다운로드를 지원합니다. 저장·공유·재게시를 구매전환으로 보지 않으며 집계기간이 다른 조회수를 합산하지 않습니다.

## 최신 관측: 2026-10-27

- 4채널 지표 120개, 식별 콘텐츠 9개. YouTube 개별 ID 미확인 커뮤니티 글은 별도 관측으로 보관합니다.
- Instagram @phorin_i, X @phorin_x, Facebook phorin2, YouTube 채널 UCWt7-0sU659Gcuyr7jYLILQ.
- Facebook 계정 기간: 2026-09-27~10-26. YouTube 계정 기간: 2026-09-28~10-25. Instagram은 최근30일 UI(경계일 미표시). 콘텐츠 누적·현재표시·최신실적 카드는 별도 기준입니다.
- YouTube Shorts WINNYq_TNiM은 오디오 소유권 주장으로 일부 지역 차단. 채널 영향 없음, 저작권 위반 경고 아님. 차단 국가 목록 미확인.
- 매일 오전9시(Asia/Seoul) Aside 루틴이 조사·날짜 JSON·루트 대시보드 업데이트·Pages 배포 확인을 수행합니다. 실행 장치, 로그인 및 쓰기 권한이 필요합니다.
- 이전 날짜 파일 및 Git 커밋 이력 보존. dist/ 또는 레거시 build로 공개 루트를 덮어쓰지 마세요.
