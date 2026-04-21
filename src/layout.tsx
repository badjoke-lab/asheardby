export function HeroSection(props: {
  title: string;
  subtitle: string;
  lead: string;
  notice: string;
}) {
  const { title, subtitle, lead, notice } = props;

  return (
    <section className="hero-section panel panel-hero">
      <p className="eyebrow">The auditory companion volume</p>
      <h1>{title}</h1>
      <p className="subtitle">{subtitle}</p>
      <p className="lead">{lead}</p>
      <div className="notice-block">
        <p>{notice}</p>
        <ul>
          <li>Start with a low volume.</li>
          <li>Headphones are recommended for left-right asymmetry.</li>
        </ul>
      </div>
    </section>
  );
}

export function AboutPanel() {
  return (
    <section className="panel panel-about">
      <div className="section-header">
        <p className="eyebrow">About</p>
        <h2>About this project</h2>
      </div>
      <p>
        AsHeardBy translates commonly described hearing differences into a browser-based comparison experience.
        It is intended for reference and communication, not diagnosis or exact recreation of any single person’s hearing.
      </p>
    </section>
  );
}
