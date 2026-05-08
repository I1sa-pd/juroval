const team = [
  {
    name: "Lina Mancera",
    role: "Abogada Especialista en Derecho Administrativo",
    image: "https://jurovalegal.com/wp-content/uploads/2025/10/perfil-3-1.jpg",
  },
  {
    name: "Rusbel Perdomo",
    role: "Abogado, Oficial Retirado del Ejército",
    image: "https://jurovalegal.com/wp-content/uploads/2025/10/perfil-2-1.jpg",
  },
  {
    name: "Yenny Mancera",
    role: "Abogada Especialista en Derecho Administrativo, Ambiental y Contratación Estatal",
    image: "https://jurovalegal.com/wp-content/uploads/2025/11/perfil-4.jpg",
  },
  {
    name: "Luisa Fajardo",
    role: "Psicóloga Especialista en Psicología Forense",
    image: "https://jurovalegal.com/wp-content/uploads/2025/12/perfil-5.jpg",
  },
];

const TeamSection = () => (
  <section className="bg-muted/50 py-20">
    <div className="container mx-auto px-6">
      <div className="text-center mb-14">
        <p className="font-body text-sm uppercase tracking-widest text-accent mb-3">Reúnete con nuestros especialistas jurídicos</p>
        <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
          Estamos aquí para ayudarte
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
        {team.map((member) => (
          <div key={member.name} className="text-center group">
            <div className="w-40 h-40 mx-auto mb-4 rounded-full overflow-hidden border-4 border-accent/20 group-hover:border-accent/50 transition-colors">
              <img
                src={member.image}
                alt={member.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <h3 className="font-display text-lg font-bold text-foreground">{member.name}</h3>
            <p className="font-body text-sm text-muted-foreground mt-1 leading-snug">{member.role}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default TeamSection;
