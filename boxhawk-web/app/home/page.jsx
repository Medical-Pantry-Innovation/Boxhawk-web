import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  return (
    <main style={styles.page}>
      {/* Navigation */}
      <header style={styles.header}>
        <div>
            <Image
            src="/images/medishelf_logo.png"
            alt="MediShelf Logo"
            width={140}
            height={70}
            priority
            />
        </div>

        <nav style={styles.nav}>
          <Link href="#benefits" style={styles.navLink}>
            Benefits
          </Link>

          <Link href="#contact" style={styles.navLink}>
            Contact us
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section style={styles.hero}>
        <h1 style={styles.title}>
          Every image.
          <br />
          improves healthcare.
        </h1>

        <div style={styles.content}>
          {/* Left */}
          <div style={styles.left}>
            <p style={styles.description}>
              MediShelf is a collaborative project between Medical Pantry and
              the Healthcare Carbon Lab (The University of Melbourne).
            </p>

            <Link href="/login">
              <button style={styles.button}>Get started</button>
            </Link>

          </div>

          {/* Right */}
          <div style={styles.imageContainer}>
            <Image
              src="/images/medishelf_homepage_img1.png"
              alt="Medical Shelf"
              width={850}
              height={600}
              style={styles.heroImage}
            />
          </div>
        </div>
        <div style={{ marginTop: 80 }}>
            <p style={styles.supported}>Supported by:</p>
        </div>
      </section>

      {/* Footer Logos */}
      <footer style={styles.footer}>
        <Image
          src="/images/medical_pantry_logo.png"
          alt="Medical Pantry"
          width={190}
          height={110}
        />

        <Image
          src="/images/unimelb_logo.png"
          alt="University of Melbourne"
          width={100}
          height={100}
        />
      </footer>
      {/* Benefits Section */}
        <section id="benefits" style={styles.benefits}>

        <p style={styles.sectionLabel}>
            Benefits
        </p>

        <h2 style={styles.sectionTitle}>
            We’re going to crack the medical packaging code.
        </h2>

        <p style={styles.sectionDescription}>
            Every day millions of medical products are purchased globally.
            <br />
            What if there was a way to learn more about what is being stocked
            on your shelf and put them all into one place.
            <br />
            If we can do this we can fundamentally transform how we understand
            medical device labelling and recovery.
        </p>


  <hr style={styles.divider}/>


    {/* Main benefits image */}
    <Image
        src="/images/medishelf_homepage_img2.png"
        alt="Medical products"
        width={1125}
        height={633}
        style={styles.benefitImage}
    />


    <hr style={styles.divider}/>


    {/* Big picture */}
    <h2 style={styles.sectionTitle}>
        See the big picture
    </h2>

    <p style={styles.sectionDescription}>
        MediShelf enables you to be a MediMate, allowing you to understand
        what products you commonly see on your shelf.
    </p>


    <hr style={styles.divider}/>


    {/* Steps */}
    <div style={styles.steps}>

        <div>
        <h3 style={styles.stepNumber}>
            01
        </h3>
        <p style={styles.stepText}>
            Take a photo on your phone.
        </p>
        </div>


        <div>
        <h3 style={styles.stepNumber}>
            02
        </h3>
        <p style={styles.stepText}>
            MediShelf automatically extracts
            key information.
        </p>
        </div>


        <div>
        <h3 style={styles.stepNumber}>
            03
        </h3>
        <p style={styles.stepText}>
            Build a shared medical device inventory
            library.
        </p>
        </div>

    </div>


    <hr style={styles.divider}/>


    {/* Contact CTA */}
    <section id="contact" style={styles.contact}>

        <h2 style={styles.contactTitle}>
        Become a MediMate
        </h2>


        <p style={styles.sectionDescription}>
        Help us transform medical device data into data for resource recovery.
        </p>


        <Link href="/contact">
        <button style={styles.contactButton}>
            Contact us
        </button>
        </Link>

    </section>


    <hr style={styles.divider}/>


    {/* Team */}
    <div style={styles.team}>

        <p style={styles.teamTitle}>
        Team
        </p>

        <p>Dr Julie Dao</p>
        <p>WingYee He</p>
        <p>James Baikie</p>
        <p>Nikheisha</p>
        <p>Annika</p>

    </div>


    </section>
    </main>
  );
}

const styles = {
  page: {
    maxWidth: "1280px",
    margin: "0 auto",
    padding: "30px 70px",
    fontFamily: "Arial, sans-serif",
    background: "#fff",
    minHeight: "100vh",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 40,
  },

  nav: {
    display: "flex",
    gap: 40,
  },

  navLink: {
    color: "#666",
    textDecoration: "none",
    fontWeight: 600,
    fontSize: 18,
  },

  hero: {},

  title: {
    fontSize: "92px",
    fontWeight: 500,
    lineHeight: 1,
    textAlign: "center",
    marginBottom: 50,
    color: "#000",
  },

  content: {
    display: "flex",
    gap: 40,
    alignItems: "flex-end",
  },

  left: {
    width: 270,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },

  description: {
    fontSize: 22,
    lineHeight: 1.5,
    color: "#111",
  },

  button: {
    marginTop: 30,
    width: "100%",
    background: "#151a67",
    color: "#fff",
    border: "none",
    borderRadius: 40,
    padding: "18px",
    fontSize: 32,
    fontWeight: "bold",
    cursor: "pointer",
  },

  supported: {
    fontSize: 22,
    color: "#666",
  },

  imageContainer: {
    flex: 1,
  },

  heroImage: {
    width: "100%",
    height: "auto",
    borderRadius: 35,
    objectFit: "cover",
  },

    footer: {
    marginTop: 60,
    paddingTop: 30,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 120,
    },
    benefits: {
    marginTop: 100,
    paddingTop: 60,
    borderTop: "1px solid #ddd",
    },


sectionLabel: {
  fontSize: 18,
  color: "#777",
  marginBottom: 40,
},


sectionTitle: {
  fontSize: 48,
  fontWeight: 400,
  lineHeight: 1.2,
  color: "#000",
  marginBottom: 30,
},


sectionDescription: {
  fontSize: 18,
  lineHeight: 1.6,
  color: "#777",
},


divider: {
  border: "none",
  borderTop: "1px solid #ddd",
  margin: "60px 0",
},


benefitImage: {
  width: "100%",
  height: "auto",
  borderRadius: 35,
  objectFit: "cover",
},


steps: {
  display: "flex",
  justifyContent: "space-between",
  gap: 50,
},


stepNumber: {
  fontSize: 72,
  fontWeight: 300,
  color: "#777",
  marginBottom: 30,
},


stepText: {
  fontSize: 18,
  color: "#666",
  maxWidth: 250,
  lineHeight: 1.5,
},


contact: {
  textAlign: "center",
  padding: "50px 0",
},


contactTitle: {
  fontSize: 48,
  fontWeight: 400,
  marginBottom: 30,
},


contactButton: {
  marginTop: 30,
  background: "#151a67",
  color: "white",
  border: "none",
  borderRadius: 40,
  padding: "18px 70px",
  fontSize: 24,
  fontWeight: "bold",
  cursor: "pointer",
},


team: {
  color: "#777",
  fontSize: 16,
  lineHeight: 1.5,
},


teamTitle: {
  fontWeight: "bold",
  marginBottom: 5,
},
};