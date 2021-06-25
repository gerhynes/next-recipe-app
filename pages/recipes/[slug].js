import { useState } from "react";
import { useRouter } from "next/router";
import {
  sanityClient,
  urlFor,
  usePreviewSubscription,
  PortableText
} from "../../lib/sanity";

const recipeQuery = `*[_type == "recipe" && slug.current == $slug][0]{
  _id,
  name, 
  summary,
  slug,
  mainImage,
  ingredient[]{
    _key,
    unit,
    wholeNumber,
    fraction,
    ingredient->{
      name
    }
  },
  instructions,
  likes
}`;

export default function OneRecipe({ data }) {
  const router = useRouter();
  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  const { recipe } = data;

  // Previews
  // const { data: recipe } = usePreviewSubscription(recipeQuery, {
  //   params: { slug: data.recipe?.slug.current },
  //   initialData: data,
  //   enabled: preview
  // });

  const [likes, setLikes] = useState(data?.recipe?.likes);

  const addLike = async () => {
    const res = await fetch("/api/handle-like", {
      method: "POST",
      body: JSON.stringify({ _id: recipe._id })
    }).catch((error) => console.log(error));
    const data = await res.json();
    setLikes(data.likes);
  };

  return (
    <article className="recipe">
      <h1 className="heading-main">{recipe.name}</h1>
      <h2 className="heading-secondary">{recipe?.summary}</h2>
      <button className="like-button" onClick={addLike}>
        {likes} ❤️
      </button>
      <main className="content">
        <img src={urlFor(recipe?.mainImage).url()} alt={recipe?.name} />
        <div className="breakdown">
          <h3 className="heading-small">Ingredients</h3>
          <ul className="ingredients">
            {recipe.ingredient?.map((ingredient) => (
              <li key={ingredient._key} className="ingredient">
                {ingredient?.ingredient.name} -{ingredient?.fraction}{" "}
                {ingredient?.wholeNumber} {ingredient?.unit}
              </li>
            ))}
          </ul>
          <div>
            <h3 className="heading-small">Method</h3>
            <PortableText
              blocks={recipe?.instructions}
              className="instructions"
            />
          </div>
        </div>
      </main>
    </article>
  );
}

export async function getStaticPaths() {
  const paths = await sanityClient.fetch(
    `*[_type == "recipe" && defined(slug.current)]{
      "params": {
        "slug": slug.current
      }
    }`
  );
  return {
    paths,
    fallback: true
  };
}

export async function getStaticProps({ params }) {
  const { slug } = params;
  const recipe = await sanityClient.fetch(recipeQuery, { slug });
  return { props: { data: { recipe } } };
}
