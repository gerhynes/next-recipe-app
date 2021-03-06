import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { sanityClient, urlFor } from "../lib/sanity";

const recipesQuery = `*[_type == "recipe"]{
  _id,
  name,
  summary,
  slug,
  mainImage
}`;

export default function Home({ recipes }) {
  return (
    <div>
      <Head>
        <title>Julie's Kitchen</title>
        <meta name="description" content="A recipe app built with Next.js" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1 className="heading-main">Welcome to Julie's Kitchen</h1>
      <h2 className="heading-secondary">
        Exploring the best recipes from Italy and Quebec
      </h2>

      <ul className="recipes-list">
        {recipes?.length > 0 &&
          recipes.map((recipe) => (
            <li key={recipe._id} className="recipe-card">
              <Image
                src={urlFor(recipe.mainImage).url()}
                alt={recipe.name}
                width={800}
                height={533}
                priority="true"
              />
              <h3>{recipe.name}</h3>
              <p>{recipe?.summary}</p>
              <Link href={`/recipes/${recipe.slug.current}`}>
                <a>Read the full recipe</a>
              </Link>
            </li>
          ))}
      </ul>
    </div>
  );
}

export async function getStaticProps() {
  const recipes = await sanityClient.fetch(recipesQuery);
  return { props: { recipes } };
}
