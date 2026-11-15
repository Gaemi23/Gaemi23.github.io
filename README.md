# Gaemi

GitHub Pages에서 사용할 수 있는 한국어 Jekyll 블로그입니다. 글 목록, 글 상세, 소개 페이지와 SEO 메타 정보를 포함합니다.

## 로컬 실행

Ruby와 Bundler를 설치한 환경에서 실행합니다.

```sh
bundle config set --local path vendor/bundle
bundle install
bundle exec jekyll serve --host 127.0.0.1
```

브라우저에서 http://127.0.0.1:4000 으로 접속합니다. 빌드만 하려면 `bundle exec jekyll build`를 실행하세요. `_config.yml`을 바꾼 뒤에는 서버를 다시 시작합니다.

## GitHub Pages 배포

1. GitHub에서 `계정명.github.io` 이름으로 저장소를 만듭니다.
2. `_config.yml`에서 `url`을 `https://계정명.github.io`로 변경합니다. `baseurl`은 빈 문자열로 둡니다.
3. 이 폴더의 파일을 저장소의 `main` 브랜치에 올립니다.
4. 저장소 **Settings → Pages → Build and deployment**에서 **Deploy from a branch**, **main**, **/ (root)**를 선택하고 저장합니다.
5. 배포 완료 후 `https://계정명.github.io`에서 확인합니다. 진행 상황과 오류는 저장소 Actions에서 확인할 수 있습니다.

기존 Git 저장소가 없는 경우:

```sh
git init -b main
git add .
git commit -m "Create Jekyll blog"
git remote add origin https://github.com/계정명/계정명.github.io.git
git push -u origin main
```

일반 저장소 `blog`를 사용하면 `url`은 `https://계정명.github.io`, `baseurl`은 `/blog`로 설정합니다. 배포 주소는 `https://계정명.github.io/blog/`입니다.

공식 안내: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## 글 쓰기

`_posts/YYYY-MM-DD-slug.md`를 만들고 다음 형식으로 작성합니다.

```markdown
---
title: "새 글 제목"
description: "글 목록에 표시할 요약"
categories: [개발]
---

여기부터 마크다운 본문을 작성하세요.
```

미래 날짜의 글은 해당 날짜가 되기 전에는 표시되지 않습니다. 예제 글은 수정하거나 삭제해도 됩니다.

## 꾸미기

- 블로그 이름과 설명: `_config.yml`
- 소개: `about.md`
- 첫 화면 문구: `index.html`
- 색상·폰트·레이아웃: `assets/css/notebook.css`

아직 GitHub 계정, 저장소 및 실제 배포 주소는 연결되어 있지 않습니다.

## 프로필 사진

현재 프로필은 `assets/images/gaemi.png`입니다. 사용할 사진을 `assets/images/profile.jpg`에 넣고 `_config.yml`의 `profile_image`를 `/assets/images/profile.jpg`로 변경하세요. 정사각형 영역에 맞춰 표시됩니다.

## 카테고리

글의 머리말에 `categories: [개발, 회고]`처럼 적으면 `/categories/`의 목차와 글 목록이 자동으로 갱신됩니다. 첫 화면과 글 상세의 카테고리 이름을 눌러 해당 목록으로 이동할 수 있습니다.

기본 보안 카테고리는 `pwn`, `rev`, `crypto`, `web`, `forensics`, `misc`이며 글이 없어도 목차에 표시됩니다. 예를 들어 `categories: [pwn]`으로 글을 분류하세요. 기본 순서는 `_config.yml`의 `blog_categories`에서 변경하며, 이외의 카테고리도 글을 작성하면 자동으로 추가됩니다.

## 임시 낙서 공간

첫 화면 아래의 ‘낙서하기’를 펼치면 마우스·터치·펜으로 그릴 수 있습니다. 세 가지 펜 색상, 지우개, 획 되돌리기와 전체 지우기를 지원합니다. 접었다 펴거나 창 크기를 바꿔도 현재 낙서는 유지되며, 새로고침하거나 페이지를 벗어나면 사라집니다. 낙서는 서버나 브라우저 저장소에 저장하지 않습니다.
