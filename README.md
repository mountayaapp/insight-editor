# Mountaya Insight Editor

The **Mountaya Insight Editor** is a powerful, open-source application for creating
insightful geospatial maps. Leveraging the capabilities of [kepler.gl](https://kepler.gl/)
and [DuckDB](https://duckdb.org/), it empowers anyone to design sophisticated maps,
either for private analysis or for sharing within the Mountaya platform as part
of our **Mountaya Insight Series**.

![Mountaya Insight Editor](./assets/recording.gif)

## Get started

<details>
  <summary>Visit online version</summary>

  An online version of the Insight Editor is available for free to anyone at
  <https://editor.mountaya.com/>.
</details>

<details>
  <summary>Running with npm</summary>

  Ensure required environment variables defined in the next section are set.

  Install dependencies:
  ```sh
  $ npm install --legacy-peer-deps
  ```

  Run the application:
  ```sh
  $ npm run dev
  ```
</details>

## Environment variables

### Required

- `MAPTILER_API_KEY`: The MapTiler API key for using MapTiler's map styles.

### Optional

- `KEPLERGL_THEME`: The kepler.gl theme to apply. Must be one of
  `light`, `dark`. Default: `light`.

## Professional services

Beyond this editor, Mountaya offers professional services to our partners to
transform their geospatial challenges into clear, actionable insights. We provide
comprehensive, end-to-end solutions, including:

- **Tailored map design:** Data visualizations with the Mountaya Insight Editor,
  designed to highlight your unique data and objectives with clarity and impact.
- **Custom ETL/ELT data pipelines:** High-performance, tailored data pipelines
  that effortlessly integrate, transform, and process your geospatial data.
- **Powerful Tile APIs:** Scalable Tile APIs designed to perfectly align with
  your mapping and analytical needs.

The result of these personalized solutions, known as a **Mountaya Insight**,
is the map exported by the Insight Editor. This workflow ensures a powerful,
seamless, and unified experience across all Mountaya Insights, helping you to
visualize and understand your most complex geospatial challenges with unparalleled
clarity. You maintain full control over your Mountaya Insights, choosing whether
they remain exclusively private to your organization or are shared with the wider
Mountaya community as part of our **Mountaya Insight Series**.

Ready to get started with Mountaya Insight Editor and Insight Series? [Complete
our access request form](https://form.typeform.com/to/M23XWGhE) and we'll get back
you.

## License

Repository licensed under the [MIT License](./LICENSE.md).
