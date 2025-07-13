---
title: "Fighting AI Hallucinations One Citation at a Time: Introducing the LLM Citation Verifier"
categories:
  - Blog
tags:
  - llm
  - research integrity
  - GenAI
---

As AI writing assistants become more prevalent in academic and professional settings, we face a growing challenge: how do we maintain the integrity of the scholarly record when AI systems can generate convincing but fabricated citations? This problem has been on my mind lately, so I decided to build a simple tool to address it—and use the project as an opportunity to explore some modern Python practices that have emerged in recent years.

## The Problem We're Solving

Large language models have an unfortunate tendency to hallucinate academic citations. They'll generate perfectly formatted DOIs that look legitimate but reference papers that don't exist. This isn't just an annoyance—it's a threat to research integrity that affects publishers, researchers, and the broader academic community.

We saw this problem play out dramatically in May 2025, when the White House's "Make America Healthy Again" report was found to contain multiple citations to nonexistent papers, with experts identifying these as hallmarks of artificial intelligence generation. The [Washington Post found](https://www.washingtonpost.com/health/2025/05/29/maha-rfk-jr-ai-garble/) that some references included "oaicite" markers attached to URLs—a definitive sign that the research was collected using artificial intelligence. The initial report contained over 500 citations, but at least seven of the cited sources didn't appear to exist at all.

The problem is particularly acute when AI tools generate content that includes citations, as these fake references can easily slip through editorial review processes if not properly verified. Traditional fact-checking approaches don't scale when dealing with AI-generated content that might include dozens of citations.

## A Learning Project with Real-World Impact

The [LLM Citation Verifier](https://github.com/DWFlanagan/llm-citation-verifier) started as a personal hobby project to solve a problem I kept encountering, but it also became a playground for exploring modern Python development practices. As someone who's been coding for years but wanted to catch up on recent ecosystem changes, this project let me experiment with tools like [uv for package management](https://dwflanagan.com/blog/til-publishing-packages/) and [GitHub Copilot](https://github.com/features/copilot) as a pair programming partner.

The tool itself is a plugin for Simon Willison's excellent [LLM](https://llm.datasette.io/) command-line tool that automatically verifies academic citations against the Crossref database in real-time. It's designed to catch hallucinated references before they make it into published content.

### Key Features

**Real-time verification** - The tool integrates directly into the LLM generation process, checking citations as they're created rather than after the fact.

**Comprehensive validation** - Beyond just checking if a DOI exists, the tool returns full metadata including title, authors, journal, and publication year to help verify context.

**Simple integration** - Works with any LLM that integrates with the LLM tool, making it easy to add to existing workflows.

**Hallucination detection** - Clearly flags non-existent DOIs and provides detailed error messages to help identify fabricated citations.

## How It Works

The plugin taps into the [Crossref API](https://www.crossref.org/documentation/retrieve-metadata/rest-api/) to verify Digital Object Identifiers (DOIs) in real-time. Here's a typical workflow:

```bash
llm -T verify_citation "What's new in dye sensitized solar cells? Check all references." --td
```

When the LLM generates content with citations, the plugin automatically:

1. Extracts DOI references from the generated text
2. Queries the Crossref database to verify each DOI exists
3. Returns full metadata for valid citations
4. Flags invalid DOIs with clear error messages

Here's an example of the plugin in action with a single DOI verification:

```bash
❯ llm -T verify_citation "Verify this DOI: 10.1038/nature12373" --td
I'll verify that DOI for you using the Crossref database.
Tool call: verify_citation({'doi': '10.1038/nature12373'})
  {
    "verified": true,
    "doi": "10.1038/nature12373",
    "title": "Nanometre-scale thermometry in a living cell",
    "authors": "G. Kucsko, P. C. Maurer, N. Y. Yao, et al.",
    "journal": "Nature",
    "publisher": "Springer Science and Business Media LLC",
    "year": "2013",
    "url": "https://doi.org/10.1038/nature12373"
  }
The DOI 10.1038/nature12373 has been verified successfully! Here are the details:
**Verified Citation:**
- **Title:** Nanometre-scale thermometry in a living cell
- **Authors:** G. Kucsko, P. C. Maurer, N. Y. Yao, et al.
- **Journal:** Nature
- **Publisher:** Springer Science and Business Media LLC
- **Year:** 2013
- **DOI URL:** https://doi.org/10.1038/nature12373
The DOI is valid and resolves to a legitimate scientific paper published in Nature about nanoscale temperature measurement in living cells.
```

The `--td` flag provides transparency by showing the verification process in real-time, so you can see exactly which citations are being checked.

## Learning Modern Python Along the Way

Building this tool gave me a chance to explore several Python ecosystem improvements that have emerged in recent years:

**Modern package management with uv** - I used [uv](https://docs.astral.sh/uv/) for dependency management and publishing, which is significantly faster than traditional pip-based workflows. The experience was smooth enough that I [wrote about it](https://dwflanagan.com/blog/til-publishing-packages/) as my first "Today I Learned" post.

**GitHub Copilot as a pair programmer** - This project was my first serious experiment with Copilot for both writing and testing code. The AI assistance was particularly helpful for generating comprehensive test cases and handling edge cases in the Crossref API integration.

**Plugin architecture patterns** - Working with the LLM tool's plugin system taught me about modern Python plugin patterns and how to build tools that integrate cleanly with existing workflows.

## Real-World Applications

While this started as a personal project, it addresses several practical use cases I've observed in academic and professional contexts:

**Editorial workflows** - Verify citations in AI-assisted manuscript preparation before publication. No more embarrassing retractions due to fake references.

**Research integrity** - Audit AI-generated literature reviews and research summaries to ensure all citations are legitimate.

**Content quality control** - Implement systematic verification for AI writing assistants used in academic contexts.

**Fact-checking** - Validate suspicious citation claims in submitted manuscripts or peer review processes.

## Why This Matters for Publishing

The academic publishing industry is at an inflection point with AI. While these tools can dramatically improve productivity and accessibility, they also introduce new risks to the scholarly record. [Research has shown](https://arxiv.org/abs/2305.14627) that current AI systems "have considerable room for improvement" when it comes to citation quality, with even the best models lacking complete citation support 50% of the time.

The recent MAHA report controversy demonstrates how citation errors can undermine the credibility of even high-profile documents. As [Georges Benjamin from the American Public Health Association noted](https://www.washingtonpost.com/health/2025/05/29/maha-rfk-jr-ai-garble/), "This is not an evidence-based report, and for all practical purposes, it should be junked at this point... It cannot be used for any policymaking. It cannot even be used for any serious discussion, because you can't believe what's in it."

As those of us working in publishing navigate this transition, we need practical tools that help manage AI-related risks without stifling innovation. Tools like this citation verifier represent a grassroots approach to maintaining quality standards while embracing the productivity benefits of AI—though obviously, any production implementation would require much more robust architecture and testing.

## Getting Started

Installation is straightforward, assuming you have `llm` installed:

```bash
llm install llm-citation-verifier
```

The tool works with any topic and integrates seamlessly into existing LLM workflows for models that support tool use. Simply add something like "verify citations" to your prompt and the plugin handles the rest.

For development teams, the plugin's architecture provides a foundation for building more sophisticated verification systems. The source code is available on [GitHub](https://github.com/DWFlanagan/llm-citation-verifier) for customization and extension.

## Looking Forward

This tool represents one small step toward more trustworthy AI-assisted research—and a fun way to explore modern Python development practices. As the academic community continues to integrate AI tools into research workflows, we need practical solutions that balance innovation with integrity.

The LLM Citation Verifier won't solve every challenge related to AI and academic publishing, but it addresses a specific, high-impact problem that affects anyone working with AI-generated research content. Plus, building it gave me hands-on experience with tools like uv and GitHub Copilot that I'll definitely use in future projects.

In a world where AI can fabricate convincing citations in seconds, having automated verification tools isn't just convenient—it's essential. Give it a try the next time you're working with AI-generated research content, and feel free to contribute to the project if you find it useful.
