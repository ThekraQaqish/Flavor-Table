window.addEventListener('load', () => {
  const randomContainer = document.getElementById('random-recipe');
  if (randomContainer) {
    fetchRandomRecipe();
  }

  const searchBtn = document.getElementById('searchButton');
  if (searchBtn) {
    searchBtn.addEventListener('click', search);
  }

  const FavContainer = document.getElementById('favorites-list');
  if (FavContainer) {
    RenderFavs();
  }
  const updateForm = document.getElementById('updateForm');
  if (updateForm) {
    updateForm.style.display = 'none';
  }


 const path = window.location.pathname;


  if (path.includes('/recipes/details')) {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id'); 

    if (id) {
      viewDetails(id);
    } else {
      console.error('No ID found in URL');
    }
  }



});





  async function fetchRandomRecipe() {
  try {
    const response = await axios.get('/recipes/random/api');
    const recipe=response.data.recipes[0];
    const container = document.getElementById('random-recipe');
    const card= document.createElement('div');
    card.className='card';
    let ingredintes='<p>no ingredients found</p>';
    if(recipe.extendedIngredients.length>0 && recipe.extendedIngredients){
      ingredintes=recipe.extendedIngredients.map(ingredint=>`<li>${ingredint.original}</li>`).join('');
    }

    card.innerHTML=`
    <h3> ${recipe.title}</h3>
    <img src="${recipe.image}">
    <p>${recipe.instructions}</p>
    <p>${ingredintes}</p>
    `
    container.innerHTML = ''; 
    container.appendChild(card);
  } catch (error) {
    console.error(error);
  }
}

async function search(){
  try {
    const ingredientInput = document.getElementById('searchInput').value;
    const response = await axios.get(`/recipes/search/api?ingredients=${ingredientInput}`);
    const recipes= response.data;
    const container=document.getElementById('recipeContainer');
    recipes.forEach(recipe=>{
      const card = document.createElement('div');
      card.className='card';
      let missedIngredients = '<p>No Missed Ingredients</p>';

    if (recipe.missedIngredients && recipe.missedIngredients.length > 0) {
      missedIngredients = recipe.missedIngredients
        .map(ingredient => `<li>${ingredient.original}</li>`)
        .join('');
    }

      let ingredintes='<p>no ingredients found</p>';
      if(recipe.usedIngredients){
        ingredintes=recipe.usedIngredients.map(ingredint=>`<li>${ingredint.original}</li>`).join('');
      }

      card.innerHTML=`
        <h3>${recipe.title}</h3>
        <img src="${recipe.image}">
        <p><u><h4>Ingredients</h4></u></br> ${ingredintes}</p>
        <p><u><h4>Missed Ingredients</h4></u></br> ${missedIngredients}</p>
        <button onclick="saveToFav(${recipe.id})">Save To Favorites</button>
        <button onclick="window.location.href='/recipes/details?id=${recipe.id}'">View Details</button>
      `;
      container.appendChild(card);
    })

  } catch (error) {
    console.log('error', error);

  }
}


//لما المستخدم يضغط زر "أضف للمفضلة"
// ، نرسل ID
//  الوصفة للسيرفر 
// (route)
//  عشان يخزنها في قاعدة البيانات،
//  وننتظر الرد
async function saveToFav(id){
  try{
    //هاد السطر هو الي بربط الفرونت بالباك عن طريق الاند بوينت 
    //عشان ينفذلي الطلب الي بعمله الراوت الي لهاي الاند بوينت 
    // واللي هو رح يكون هيك : 
    // router.get('/saveToFav/:id', ...) = GET /saveToFav/12345
    const response= await axios.get(`/recipes/saveToFav/${id}`);// get the recipe from the server
      if (response.data.message === 'Recipe already in favorites') {
      alert("Recipe is already in favorites!");
    } else {
      alert("Recipe saved to favorites!");
    }

      return response.data; 
    }
  catch(error) {
  console.error("Error saving recipe:", error);
  alert("Failed to save recipe.");
};
}




async function RenderFavs(){
  const response= await axios.get('/recipes/favorites/all');
  const container= document.getElementById('favorites-list');
  let cards=response.data;
  container.innerHTML = '';
  if(cards){
    cards.forEach(recipe=>{
      const card= document.createElement('div');
      card.className='card';
      card.innerHTML=`
        <h3>${recipe.title}</h3>
        <img src="${recipe.image}">
        <button onclick="RemoveFav(${recipe.id})">Remove</button>
        <button onclick="viewupdateForm(${recipe.id})">Update Recipe</button>
      `;

      container.appendChild(card);
      })
  }
  else{
    container.innerHTML= '<p>No recipes saved to favorites</p>';
  }
}

async function RemoveFav(id){
  try{
    const response = await axios.delete(`/recipes/favorites/${id}`);
    RenderFavs();
    return response.data; 
  }
  catch(error){
    console.error('Error removing recipe:', error);
  }
}


async function viewDetails(id){
  const container=document.getElementById('recipeDetails');
  console.log('Container:', container);
  try {
    const response= await axios.get(`/recipes/details/api/${id}`);
    const recipe= response.data;
    // window.location.href = `/recipes/details?id=${recipe.id}`;
    container.innerHTML='';
    container.innerHTML=`
      <div class='card'>
        <h2>${recipe.title}</h2>
        <img id="recipe-image" src="${recipe.image}">
        <p id="recipe-summary">${recipe.summary}</p>
        <p id="recipe-cooking-time">${recipe.cooking_time} minutes</p>
        <h3>Instructions:</h3>
        <p id="recipe-instructions">${recipe.instructions}</p>
        <h3>Ingredients:</h3>
        <ul id="recipe-ingredients">
           ${recipe.extendedIngredients.map(ingredient => `<li>${ingredient.original}</li>` ).join('')}
        </ul>
      </div>
    `;
  } catch (error) {
    container.innerHTML=`<p class='error'>Recipe not found</p>`;
    console.log('error loading recipe details',error)
  }
}

async function viewupdateForm(id){
  window.currentUpdateId = id;
  const updateForm = document.getElementById('updateForm');
  updateForm.style.display = 'block';
  try {
    const response = await axios.get(`/recipes/favorites/${id}`);
    const recipe = response.data;

    document.getElementById('title').value = recipe.title;
    document.getElementById('imageInput').value = recipe.image;
    document.getElementById('instructions').value = recipe.instructions;
    document.getElementById('ingredients').value = recipe.ingredients || '';
    const img = document.getElementById('currentImage');
    if (img) img.src = recipe.image;
  } catch (error) {
    console.error('Error loading recipe for update:', error);
  }


}
async function updateRecipe(id){ 
  const updateForm = document.getElementById('updateForm');
  if (updateForm) {
    updateForm.style.display = 'none';
  }

  const title = document.getElementById('title').value;

  const image = document.getElementById('imageInput').value;

  const instructions = document.getElementById('instructions').value;
  let ingredients = document.getElementById('ingredients').value;
  if (!ingredients.trim().startsWith('[')) {
    ingredients = ingredients
      .split(',')
      .map(item => item.trim())
      .filter(item => item !== "");
  } else {
    try {
      ingredients = JSON.parse(ingredients);
    } catch (error) {
      alert("Ingredients must be in valid JSON format, e.g. [\"egg\", \"milk\"]");
      return;
    }
  }
    try{
    const response = await axios.put(`/recipes/favorites/${id}`,{title,image,instructions,ingredients});
    if (!response){
      console.error('Error updating recipe:', error);
    }
    RenderFavs();
    return response.data;
  }
  catch(error){
    console.error('Error updating recipe:', error);
  }
}
