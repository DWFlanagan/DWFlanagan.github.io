---
title: "Finding secrets in 'Oops' commits"
categories:
  - Blog
tags:
  - link
link: https://trufflesecurity.com/blog/guest-post-how-i-scanned-all-of-github-s-oops-commits-for-leaked-secrets
---

As someone who gets confused beyond simple commits and pushes, this approach of spelunking for thought-to-be-deleted secrets in "oops" commits is a little scary.

> GitHub Archive logs every public commit, even the ones developers try to delete. Force pushes often cover up mistakes like leaked credentials by rewriting Git history. GitHub keeps these dangling commits, from what we can tell, forever. In the archive, they show up as “zero-commit” PushEvents. 