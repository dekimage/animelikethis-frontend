import Image from "next/image";

export const metadata = {
  title: "About Us | Anime Like This",
  description:
    "Learn more about Anime Like This and meet the admins, Dejan Gavrilovic and Darko Nikodinovski.",
  openGraph: {
    title: "About Us | Anime Like This",
    description:
      "Learn more about Anime Like This and meet the admins, Dejan Gavrilovic and Darko Nikodinovski.",
    url: "https://animelikethis.com/about",
    type: "article",
  },
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div
        className="bg-cover bg-center mb-8 p-8"
        style={{
          backgroundImage: "url('/path-to-your-custom-anime-background.jpg')",
        }}
      >
        <div className="flex justify-around items-center mb-8">
          <div className="text-center">
            <Image
              src="/path-to-dejan-avatar.jpg"
              alt="Dejan Gavrilovic"
              width={150}
              height={150}
              className="rounded-full w-32 h-32 mx-auto mb-4"
            />
            <h3 className="text-xl font-bold">Dejan Gavrilovic</h3>
            <p className="text-lg">Co-Founder & Admin</p>
          </div>
          <div className="text-center">
            <Image
              src="/path-to-darko-avatar.jpg"
              alt="Darko Nikodinovski"
              className="rounded-full w-32 h-32 mx-auto mb-4"
              width={150}
              height={150}
            />
            <h3 className="text-xl font-bold">Darko Nikodinovski</h3>
            <p className="text-lg">Co-Founder & Admin</p>
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-4 text-white">About Us</h1>
        <div className="container mx-auto px-4 py-8">
          <p className="text-lg mb-4">
            Welcome to Anime Like This! We are dedicated to helping you find
            your next favorite anime based on what you already love. Our mission
            is to provide personalized anime recommendations and insightful
            comparisons.
          </p>
          <h2 className="text-2xl font-bold mb-2">Our Story</h2>
          <p className="text-lg mb-4">
            Anime Like This was founded by a group of anime enthusiasts who
            wanted to make it easier for others to discover new and exciting
            shows. We believe that everyone has unique tastes, and we aim to
            cater to those individual preferences with our carefully curated
            recommendations.
          </p>
          <h2 className="text-2xl font-bold mb-2">Our Team</h2>
          <p className="text-lg mb-4">
            Our team consists of dedicated anime fans, developers, and writers
            who are passionate about sharing their love for anime. We work
            tirelessly to ensure that our recommendations are accurate,
            up-to-date, and tailored to your interests.
          </p>
          <h2 className="text-2xl font-bold mb-2">Contact Us</h2>
          <p className="text-lg mb-4">
            If you have any questions, suggestions, or just want to chat about
            anime, feel free to reach out to us at contact@animelikethis.com. We
            would love to hear from you!
          </p>
        </div>
        <p className="text-lg mb-4 text-white">
          Welcome to Anime Like This! We are dedicated to helping you find your
          next favorite anime based on what you already love. Our mission is to
          provide personalized anime recommendations and insightful comparisons.
        </p>
      </div>
    </div>
  );
}
