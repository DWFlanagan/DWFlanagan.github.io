---
title: "Stop Building AI Agents"
categories:
  - Blog
tags:
  - link
  - GenAI
  - agents
link: https://decodingml.substack.com/p/stop-building-ai-agents
---

Hugo-Bowne Anderson[^1] argues that agentic workflows shouldn't be your first choice because of their increased complexity and instability. Remember that GenAI is like a superhuman intern prone to glitchiness and hallucination — now imagine managing a team of them.

> ...most agent systems break down from too much complexity, not too little.
> In my demo, I had three agents working together:
>
> * A researcher agent that could browse web pages
> * A summarizer agent with access to citation tools
> * A coordinator agent that managed task delegation
>
> Pretty standard stuff, right? Except in practice:
>
> * The researcher ignored the web scraper 70% of the time
> * The summarizer completely forgot to use citations when processing long documents
> * The coordinator threw up its hands when tasks weren't clearly defined
>

He recommends trying a simpler pattern first, like prompt chaining or orchestrator-workers.

[^1]: I learned Python, pandas, and data science from Hugo's [DataCamp](https://datacamp.com) classes.
