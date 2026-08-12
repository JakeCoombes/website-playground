import { FormEvent, useMemo, useState } from "react";

type MenuCategory = "Cold" | "Hot" | "Pizza" | "Sweet" | "Drinks";

type AllergenDetail = {
  name: string;
  source: string;
  modification: string;
  caution?: string;
};

type StudyItem = {
  name: string;
  category: MenuCategory;
  price?: string;
  tags: string[];
  allergens: AllergenDetail[];
  substitutions: string[];
  tableTalk: string;
  cue: string;
  remember: string;
};

type SelectedAllergen = {
  dish: string;
  allergen: AllergenDetail;
};

const categories: MenuCategory[] = ["Cold", "Hot", "Pizza", "Sweet", "Drinks"];

const studyItems: StudyItem[] = [
  {
    name: "Charred Green Bean & Snow Pea",
    category: "Cold",
    price: "13.5",
    tags: ["GF", "VP", "Nut/seed"],
    allergens: [
      {
        name: "Dairy",
        source: "Amba labneh underneath the greens.",
        modification: "No labneh makes it vegan-prep friendly.",
        caution: "Without labneh the dish loses the creamy base.",
      },
      {
        name: "Garlic",
        source: "Garlic is in the labneh.",
        modification: "Remove the labneh.",
      },
      {
        name: "Seed",
        source: "Chickpea panko contains seed.",
        modification: "Order seed-free without fried chickpeas.",
      },
      {
        name: "Onion",
        source: "Onion is in the vinaigrette.",
        modification: "Hold vinaigrette if needed.",
      },
    ],
    substitutions: [
      "No labneh for vegan prep.",
      "Able to hold any component.",
      "Seed-free without fried chickpeas.",
    ],
    tableTalk:
      "Charred Lebanese green beans and snow peas with smoky crunch, bright yuzu-citrus vinaigrette, and creamy amba labneh.",
    cue: "Yuzu vinaigrette, amba labneh, chickpea panko, pea shoots.",
    remember: "Bright, crunchy, citrus-forward vegetable opener.",
  },
  {
    name: "Crudo Barramundi",
    category: "Cold",
    price: "14.5",
    tags: ["GF", "Raw", "Nut/seed"],
    allergens: [
      {
        name: "Fish",
        source: "Barramundi is the crudo.",
        modification: "Fish cannot be removed from this dish.",
        caution: "Raw/undercooked seafood allergy and food-safety callout.",
      },
      {
        name: "Sesame",
        source: "Sesame is in the za'atar garnish.",
        modification: "Ask to remove za'atar/sesame garnish.",
      },
    ],
    substitutions: [
      "Can remove any component.",
      "Relish cannot be modified.",
      "Cooked option: grilled.",
    ],
    tableTalk:
      "A fresh raw barramundi dish with cucumber relish, lemon, sumac, sesame, and za'atar.",
    cue: "Cucumber relish, za'atar, sumac, lemon, sesame, olive oil.",
    remember: "Raw fish with Middle Eastern spice and lemony lift.",
  },
  {
    name: "Shrimp Ceviche",
    category: "Cold",
    price: "15.5",
    tags: ["GF", "Raw"],
    allergens: [
      {
        name: "Shellfish",
        source: "Poached shrimp is the protein.",
        modification: "Shellfish cannot be removed from this dish.",
      },
      {
        name: "Onion",
        source: "Onion is in the chili-lime chips.",
        modification: "Hold chips if needed.",
      },
      {
        name: "Garlic",
        source: "Garlic is in the chili-lime chips.",
        modification: "Hold chips if needed.",
      },
      {
        name: "Sesame",
        source: "Sesame is in the za'atar.",
        modification: "Ask to remove za'atar.",
      },
    ],
    substitutions: [
      "Can remove any component.",
      "Aguachile sauce cannot be modified.",
      "Chips are fried; shrimp is poached before dressing.",
    ],
    tableTalk:
      "A refreshing shrimp ceviche with citrus, fennel, cucumber, tomato, and crunchy chili-lime chips.",
    cue: "Citrus fennel vinaigrette, cherry tomato, cucumber, lime chili chips.",
    remember: "Citrus seafood, crunchy chip pairing, easy allergy callout.",
  },
  {
    name: "Little Gem Salad",
    category: "Cold",
    price: "14",
    tags: ["GF", "VP"],
    allergens: [
      {
        name: "Nightshade",
        source: "Tomato and dressing.",
        modification: "Can hold tomatoes.",
      },
      {
        name: "Garlic",
        source: "Garlic is in the dressing.",
        modification: "Hold dressing if needed.",
      },
      {
        name: "Dairy",
        source: "Dressing and parmesan.",
        modification: "Can hold parmesan and dressing.",
      },
      {
        name: "Seed",
        source: "Sesame seed in the dish.",
        modification: "Ask to remove seed components.",
      },
    ],
    substitutions: [
      "Can hold tomatoes, chickpeas, bacon, parmesan, parsnip, or scallions.",
      "Vegan prep requires removing non-vegan components.",
    ],
    tableTalk:
      "Crisp little gem wedges with lemon-calabrese vinaigrette, smoky bacon, parmesan, tomatoes, and crunchy parsnips.",
    cue: "Chickpea crunch, bacon, tomato, parsnip chips, parmesan.",
    remember: "Salad with bacon and parmesan unless adjusted.",
  },
  {
    name: "Burrata Caprese",
    category: "Cold",
    price: "14",
    tags: ["GF prep"],
    allergens: [
      {
        name: "Dairy",
        source: "Burrata is mozzarella cheese infused with cream.",
        modification: "Can remove all components except pesto.",
        caution: "Removing burrata changes the center of the dish.",
      },
      {
        name: "Tree Nuts",
        source: "Basil walnut pesto.",
        modification: "Pesto cannot be modified.",
      },
      {
        name: "Wheat",
        source: "Baguette served with the dish.",
        modification: "Gluten-friendly prep is no bread.",
      },
    ],
    substitutions: [
      "Swap baguette for gluten-free brioche.",
      "Can remove all components except pesto.",
      "Pesto cannot be modified.",
    ],
    tableTalk:
      "Creamy burrata with heirloom cherry tomatoes, fresh basil, and basil-walnut pesto, served with bread.",
    cue: "Burrata, basil, cherry tomato, basil-walnut pesto, baguette.",
    remember: "Cheese-forward; contains walnut pesto.",
  },
  {
    name: "Rainbow Beets",
    category: "Cold",
    price: "14",
    tags: ["GF", "VP"],
    allergens: [
      {
        name: "Dairy",
        source: "Whipped chevre/goat cheese.",
        modification: "Can be removed.",
        caution:
          "Vegan prep is no cheese, but this is not a recommended vegan dish because the cheese is a core flavor.",
      },
    ],
    substitutions: [
      "Can remove goat cheese garnish.",
      "Cannot remove vinegar and black peppercorns because they are cooked with the beets.",
      "Vegan prep is no cheese, but it is not a recommended vegan dish.",
    ],
    tableTalk:
      "A light beet dish with roasted rainbow beets, whipped goat cheese, tarragon, and olive oil.",
    cue: "Oven-roasted beets, whipped chevre, tarragon, olive oil.",
    remember: "Earthy, creamy, vegetarian-friendly cold plate.",
  },
  {
    name: "Moroccan Cigars",
    category: "Hot",
    price: "14",
    tags: ["Nut/seed"],
    allergens: [
      {
        name: "Wheat",
        source: "Cigar wrapper.",
        modification: "Can hold any component, but the wrapper is part of the cigar.",
      },
      {
        name: "Egg",
        source: "Cigar wrapper/filling prep.",
        modification: "No egg-free modification listed.",
      },
      {
        name: "Dairy",
        source: "Cigar and toum crema.",
        modification: "Hold toum crema if needed.",
      },
      {
        name: "Nut",
        source: "Roasted nut in the garlic-honey glaze.",
        modification: "Hold glaze if needed.",
      },
      {
        name: "Garlic",
        source: "Toum, cigar filling, and glaze.",
        modification: "Can hold toum/glaze, but cigar filling still contains garlic.",
      },
    ],
    substitutions: ["Able to hold any component."],
    tableTalk:
      "Crispy cigars stuffed with lamb and chicken, served with garlic-honey nut glaze, pickled onion, and toum crema.",
    cue: "Lamb and chicken filling, roasted nut and garlic-honey glaze, toum crema.",
    remember: "Signature savory-sweet roll; remember lamb plus chicken.",
  },
  {
    name: "Chicken Schnitzel",
    category: "Hot",
    price: "20.5",
    tags: ["GF prep", "Nut/seed"],
    allergens: [
      {
        name: "Dairy",
        source: "Whipped feta spread.",
        modification: "Hold feta spread.",
      },
      {
        name: "Egg",
        source: "Schnitzel breading/prep.",
        modification: "No egg-free modification listed.",
      },
      {
        name: "Allium",
        source: "Onion/garlic in schnitzel, oil, sumac onions, and vinaigrette.",
        modification: "Can hold salad components, but schnitzel itself still has allium.",
      },
      {
        name: "Seed",
        source: "Dukkah oil.",
        modification: "Hold dukkah oil.",
      },
    ],
    substitutions: ["Gluten-friendly as-is.", "Ask before removing core schnitzel components."],
    tableTalk:
      "A crispy chicken schnitzel with whipped feta, lemon, dukkah oil, and a bright arugula-mint salad.",
    cue: "Whipped feta, arugula-mint salad, sumac onion, dukkah oil, lemon.",
    remember: "Crispy chicken, creamy feta, herb salad, nutty dukkah.",
  },
  {
    name: "Charred Broccoli",
    category: "Hot",
    price: "13.5",
    tags: ["GF", "V"],
    allergens: [
      {
        name: "Seed",
        source: "Sesame in the harissa-tahini sauce.",
        modification: "Can hold any component of the dish.",
      },
      {
        name: "Garlic",
        source: "Garlic oil and sauce.",
        modification: "Hold garlic oil/sauce if needed.",
      },
      {
        name: "Tree Nuts",
        source: "Candied almonds.",
        modification: "Hold candied almonds.",
      },
      {
        name: "Nightshade",
        source: "Chili flakes and sauce.",
        modification: "Hold chili/sauce if needed.",
      },
      {
        name: "Allium",
        source: "Garlic components.",
        modification: "Hold garlic components if needed.",
      },
    ],
    substitutions: ["Can hold any component of the dish.", "Vegan as-is."],
    tableTalk:
      "Charred broccoli with spicy harissa tahini, roasted garlic oil, chili, and candied almonds.",
    cue: "Harissa tahini, roasted garlic oil, chili flake, candied almond.",
    remember: "Vegan as-is; spicy, nutty, and smoky.",
  },
  {
    name: "Scallop Medallions",
    category: "Hot",
    price: "18",
    tags: ["GF"],
    allergens: [
      {
        name: "Dairy",
        source: "Melted leeks and carrot-parsnip puree.",
        modification: "Can hold leeks and puree.",
      },
      {
        name: "Fish",
        source: "Binder in the scallop medallions.",
        modification: "No fish-free modification listed.",
      },
      {
        name: "Shellfish",
        source: "Scallops are the main protein.",
        modification: "Shellfish cannot be removed from this dish.",
      },
      {
        name: "Onion",
        source: "Leeks.",
        modification: "Can hold leeks.",
      },
      {
        name: "Garlic",
        source: "Puree.",
        modification: "Hold puree if needed.",
      },
    ],
    substitutions: ["Can hold capers, beet chips, or leeks."],
    tableTalk:
      "Seared scallop medallions with a slightly sweet carrot-parsnip puree, crispy capers, leeks, and beet chips.",
    cue: "Carrot-parsnip puree, leeks, capers, beet chips, white truffle oil.",
    remember: "Seafood with sweet root puree and truffle aroma.",
  },
  {
    name: "Mediterranean Street Corn",
    category: "Hot",
    price: "13.5",
    tags: ["GF", "Nut/seed"],
    allergens: [
      {
        name: "Tree Nuts",
        source: "Hazelnut and pistachio chili crunch.",
        modification: "Any component can be removed.",
      },
      {
        name: "Dairy",
        source: "Feta and toum creme.",
        modification: "Hold feta/toum creme if needed.",
      },
      {
        name: "Garlic",
        source: "Toum creme and garlic-chili oil.",
        modification: "Hold garlic components if needed.",
      },
      {
        name: "Nightshade",
        source: "Chili crunch/paprika.",
        modification: "Hold spicy crunch if needed.",
      },
      {
        name: "Sesame",
        source: "Sesame seeds.",
        modification: "Hold sesame seeds.",
      },
    ],
    substitutions: ["Any component can be removed.", "Gluten-friendly as-is."],
    tableTalk:
      "Fire-roasted corn tossed with creamy toum, feta, crispy shallot, lemon, and hazelnut-pistachio chili crunch.",
    cue: "Toum crema, crispy shallot, hazelnut-pistachio chili crunch, feta.",
    remember: "Corn elote energy with toum, feta, and nuts.",
  },
  {
    name: "Shawarma Tacos",
    category: "Hot",
    price: "16",
    tags: ["GF", "VP", "Nut/seed"],
    allergens: [
      {
        name: "Egg",
        source: "Tahini sauce.",
        modification: "Can remove cabbage, onion, and tahini, or serve sauces on the side.",
      },
      {
        name: "Garlic",
        source: "Tahini and spice mix.",
        modification: "Sub kale tahini for lemon-garlic tahini if needed.",
      },
      {
        name: "Seed",
        source: "Spice mix and tahini.",
        modification: "Hold tahini/seed components.",
      },
      {
        name: "Onion",
        source: "Shawarma seasoning and pickled onion.",
        modification: "Hold onions.",
      },
    ],
    substitutions: [
      "Can remove cabbage, onion, or tahini, or serve sauce on the side.",
      "Vegan prep: sub white mushrooms for chicken and sub kale tahini for lemon-garlic tahini.",
    ],
    tableTalk:
      "Two grilled chicken shawarma tacos with cabbage, pickled onion, sesame, and garlic tahini.",
    cue: "Chicken pargiyot, cabbage, pickled red onion, sesame, garlic tahini.",
    remember: "Taco format, shawarma flavors, sesame/tahini allergy cue.",
  },
  {
    name: "Noa's Cauliflower",
    category: "Hot",
    price: "13.5",
    tags: ["GF", "VP"],
    allergens: [
      {
        name: "Egg",
        source: "Chipotle sauce.",
        modification: "Can hold sauce or serve it on the side.",
      },
      {
        name: "Garlic",
        source: "Chipotle sauce.",
        modification: "Hold sauce if needed.",
      },
    ],
    substitutions: [
      "Can hold sauce or serve it on the side.",
      "Vegan prep uses smoked pepper sauce mixed with marinara.",
    ],
    tableTalk:
      "A Bacari favorite: caramelized cauliflower over mixed greens with a tangy, mildly spicy chipotle sauce.",
    cue: "Caramelized cauliflower, chipotle sauce, mixed greens.",
    remember: "A Bacari staple: cauliflower, chipotle, greens.",
  },
  {
    name: "Bacari Burger",
    category: "Hot",
    price: "15",
    tags: ["GFP"],
    allergens: [
      {
        name: "Wheat",
        source: "Telera roll.",
        modification: "Serve on greens or gluten-free brioche.",
      },
      {
        name: "Egg",
        source: "Aioli and fried egg.",
        modification: "Can remove egg.",
      },
      {
        name: "Dairy",
        source: "Buttered bread.",
        modification: "Can hold butter or bread.",
      },
      {
        name: "Garlic",
        source: "Aioli.",
        modification: "Can modify sauces.",
      },
      {
        name: "Fish",
        source: "Aioli.",
        modification: "Can modify sauces.",
      },
    ],
    substitutions: [
      "Gluten-friendly: serve on greens or gluten-free brioche.",
      "Can hold onion, tomato, bread, butter, or bread components.",
      "Can modify sauces; cheese and/or bacon can be added but are not suggested.",
    ],
    tableTalk:
      "An open-faced grass-fed burger with tomato, caramelized onion, Worcestershire aioli, and a fried egg.",
    cue: "Open-faced grass-fed beef, tomato, caramelized onion, Worcestershire aioli, fried egg.",
    remember: "Open-faced burger; egg on top is the memory hook.",
  },
  {
    name: "Glazed Pork Belly",
    category: "Hot",
    price: "16",
    tags: ["Nut/seed"],
    allergens: [
      {
        name: "Pineapple",
        source: "Sauce and pork braise.",
        modification: "No pineapple-free modification listed.",
      },
      {
        name: "Fish",
        source: "Sauce and pork.",
        modification: "No fish-free modification listed.",
      },
      {
        name: "Onion",
        source: "Sauce, pork, and garnish.",
        modification: "Can remove sesame, cilantro, and scallion garnish.",
      },
      {
        name: "Garlic",
        source: "Sauce and pork.",
        modification: "No garlic-free modification listed.",
      },
      {
        name: "Sesame",
        source: "Garnish.",
        modification: "Can remove sesame.",
      },
      {
        name: "Soy",
        source: "Sauce.",
        modification: "No soy-free modification listed.",
      },
    ],
    substitutions: [
      "Can remove sesame, cilantro, or scallion.",
      "Contains soy; otherwise gluten-friendly as-is with fryer cross-contamination.",
    ],
    tableTalk:
      "Slow-braised pork belly finished crispy with a sweet-savory umami glaze, sesame, lemon, and herbs.",
    cue: "Umami mulling glaze, sesame, lemon, green onion, cilantro.",
    remember: "Rich pork with sesame and citrus finish.",
  },
  {
    name: "Lamb Shakshouka Pizza",
    category: "Pizza",
    price: "16.5",
    tags: ["Nut/seed"],
    allergens: [
      {
        name: "Wheat",
        source: "Pizza dough.",
        modification: "Gluten-free dough is available.",
      },
      {
        name: "Seed",
        source: "Lamb tomato sauce.",
        modification: "Can hold any component.",
      },
      {
        name: "Garlic",
        source: "Lamb tomato sauce.",
        modification: "Can hold any component.",
      },
      {
        name: "Onion",
        source: "Lamb tomato sauce and red onion.",
        modification: "Hold red onion or other components.",
      },
      {
        name: "Dairy",
        source: "Goat cheese emulsion.",
        modification: "Hold goat cheese emulsion.",
      },
      {
        name: "Egg",
        source: "9-minute egg.",
        modification: "Hold egg.",
      },
    ],
    substitutions: ["Gluten-free dough available.", "Able to hold any component."],
    tableTalk:
      "A savory lamb shakshouka pizza with spiced tomato sauce, goat cheese, arugula, red onion, and a nine-minute egg.",
    cue: "Pilpelchuma, arugula, red onion, goat cheese emulsion, 9-minute egg.",
    remember: "Spiced lamb pizza plus egg and goat cheese.",
  },
  {
    name: "Asian Pear & Brie Pizza",
    category: "Pizza",
    price: "16.5",
    tags: ["Vegetarian"],
    allergens: [
      {
        name: "Dairy",
        source: "Brie and guava fromage blanc.",
        modification: "All components can be held or served on the side.",
      },
      {
        name: "Gluten",
        source: "Pizza dough.",
        modification: "Gluten-free dough is available.",
      },
    ],
    substitutions: [
      "Gluten-free dough available.",
      "All components can be held or served on the side.",
    ],
    tableTalk:
      "A sweet-and-savory pizza with mild guava flavor, brie, Asian pear, and arugula.",
    cue: "Guava fromage blanc, wild arugula, brie, pear.",
    remember: "Sweet-fruit and creamy-cheese pizza.",
  },
  {
    name: "Margherita Pizza",
    category: "Pizza",
    price: "16.5",
    tags: ["Vegetarian"],
    allergens: [
      {
        name: "Wheat",
        source: "Pizza dough.",
        modification: "Gluten-free dough is available.",
      },
      {
        name: "Dairy",
        source: "Mozzarella cheeses.",
        modification: "Can substitute cheese or sauce.",
      },
      {
        name: "Garlic",
        source: "Tomato sauce.",
        modification: "Can remove sauce.",
      },
      {
        name: "Onion",
        source: "Tomato sauce.",
        modification: "Can remove sauce.",
      },
    ],
    substitutions: [
      "Gluten-free dough available.",
      "Can substitute cheese or sauce.",
      "Can remove basil.",
    ],
    tableTalk:
      "A classic margherita pizza with organic tomato sauce, mozzarella, fresh basil, and olive oil.",
    cue: "Organic tomato sauce, mozzarella, basil, olive oil; salami add-on.",
    remember: "Classic pizza; mention salami is optional.",
  },
  {
    name: "Pistachio Cremeschnitte",
    category: "Sweet",
    price: "12",
    tags: ["Nut/seed"],
    allergens: [
      {
        name: "Tree Nuts",
        source: "Pistachio is in all components.",
        modification: "No nut-free modification listed.",
      },
      {
        name: "Wheat",
        source: "Pastry.",
        modification: "No wheat-free modification listed.",
      },
      {
        name: "Dairy",
        source: "Pistachio cream.",
        modification: "No dairy-free modification listed.",
      },
    ],
    substitutions: ["No listed substitution; pistachio is in all components."],
    tableTalk:
      "A crisp layered pastry filled with pistachio cream and topped with toasted pistachios.",
    cue: "Crispy sfoglia, pistachio cream, toasted pistachios.",
    remember: "Layered pastry, all pistachio, nut allergy cue.",
  },
  {
    name: "Malabi",
    category: "Sweet",
    price: "9.5",
    tags: ["GF", "Nut/seed"],
    allergens: [
      {
        name: "Tree Nuts",
        source: "Candied pistachio topping.",
        modification: "Can remove coconut, hibiscus, and pistachio toppings.",
      },
      {
        name: "Dairy",
        source: "Rosewater custard.",
        modification: "Custard cannot be made dairy-free.",
      },
    ],
    substitutions: ["Can remove coconut, hibiscus, or pistachio toppings."],
    tableTalk:
      "A light rosewater custard, similar to panna cotta, with coconut, hibiscus syrup, and candied pistachio.",
    cue: "Rosewater custard, coconut, hibiscus, candied pistachio.",
    remember: "Floral custard dessert with pistachio.",
  },
  {
    name: "The Best Cake",
    category: "Sweet",
    price: "9.5",
    tags: ["GF"],
    allergens: [
      {
        name: "Dairy",
        source: "Cake and sauce.",
        modification: "Can remove bacon and caramel sauce.",
      },
      {
        name: "Egg",
        source: "Cake.",
        modification: "No egg-free modification listed.",
      },
    ],
    substitutions: ["Can remove bacon or caramel sauce.", "Offer vanilla ice cream add-on."],
    tableTalk:
      "A warm date cake with brown-sugar caramel and crispy bacon, sweet and a little savory.",
    cue: "Medjool dates, brown sugar caramel, crispy bacon; ice cream add-on.",
    remember: "Date cake with caramel and bacon.",
  },
  {
    name: "Bacarita",
    category: "Drinks",
    price: "17",
    tags: ["Cocktail"],
    allergens: [
      {
        name: "No listed food allergen",
        source: "Tequila, watermelon, jalapeno, basil, and lime.",
        modification: "Confirm current recipe with the bar before serving to a guest with a serious allergy.",
      },
    ],
    substitutions: ["Confirm current drink recipe with the bar for serious allergies."],
    tableTalk:
      "A house margarita-style cocktail with tequila, watermelon, jalapeno, basil, and lime.",
    cue: "Tequila, watermelon, jalapeno, basil, lime.",
    remember: "House margarita-style drink with watermelon heat.",
  },
  {
    name: "Basil Breeze",
    category: "Drinks",
    price: "15",
    tags: ["Cocktail"],
    allergens: [
      {
        name: "No listed food allergen",
        source: "Gin, lime, basil, and cucumber.",
        modification: "Confirm current recipe with the bar before serving to a guest with a serious allergy.",
      },
    ],
    substitutions: ["Confirm current drink recipe with the bar for serious allergies."],
    tableTalk:
      "A light, fresh gin cocktail with basil, cucumber, and lime.",
    cue: "Gin, lime, basil, cucumber.",
    remember: "Green, light, gin-based refresher.",
  },
  {
    name: "Open Bar",
    category: "Drinks",
    price: "32+",
    tags: ["Policy"],
    allergens: [
      {
        name: "Ask bartender",
        source: "Open bar can include beer, wine, mimosa, bellini, sangria, and well-liquor cocktails.",
        modification: "Check the exact drink recipe before allergy guidance.",
      },
    ],
    substitutions: ["Whole party participates.", "Signature cocktails cost more."],
    tableTalk:
      "A 90-minute open-bar option for beer, wine, mimosas, bellinis, sangria, and select cocktails.",
    cue: "90-minute beer, wine, mimosa, bellini, sangria option; whole party participates.",
    remember: "Timing starts with first round; signature cocktails cost more.",
  },
];

const pairings = [
  "Light start: Charred Green Bean & Snow Pea, Crudo Barramundi, Basil Breeze.",
  "Comfort set: Moroccan Cigars, Mac & Cheese, The Best Cake.",
  "Vegetable-forward: Rainbow Beets, Charred Broccoli, Noa's Cauliflower.",
  "Server allergy watch: Burrata Caprese, Mediterranean Street Corn, Pistachio Cremeschnitte.",
];

const menuSourceUrl = "https://www.eatwithbacari.com/playa-del-rey";
const accessPassword = "BacariSilverLake";

function BacariDinnerStudyGuide() {
  const [activeCategory, setActiveCategory] = useState<MenuCategory | "All">(
    "All"
  );
  const [showAnswers, setShowAnswers] = useState(true);
  const [quizIndex, setQuizIndex] = useState(0);
  const [passwordInput, setPasswordInput] = useState("");
  const [accessError, setAccessError] = useState("");
  const [hasAccess, setHasAccess] = useState(
    () => sessionStorage.getItem("bacariDinnerAccess") === "granted"
  );
  const [selectedAllergen, setSelectedAllergen] =
    useState<SelectedAllergen | null>(null);

  const filteredItems = useMemo(() => {
    if (activeCategory === "All") {
      return studyItems;
    }

    return studyItems.filter((item) => item.category === activeCategory);
  }, [activeCategory]);

  const quizItem = studyItems[quizIndex];

  const nextQuizItem = () => {
    setQuizIndex((current) => (current + 1) % studyItems.length);
  };

  const unlockGuide = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (passwordInput === accessPassword) {
      sessionStorage.setItem("bacariDinnerAccess", "granted");
      setHasAccess(true);
      setAccessError("");
      return;
    }

    setAccessError("That password does not match.");
  };

  if (!hasAccess) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#10120f] px-5 text-[#f7f0e4]">
        <section className="w-full max-w-md rounded-[1.5rem] border border-white/10 bg-white/[0.07] p-6 shadow-2xl shadow-black/30">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#d9a760]">
            Protected study guide
          </p>
          <h1 className="mt-4 font-serif text-4xl leading-tight">
            Bacari Dinner
          </h1>
          <p className="mt-3 leading-7 text-[#d7cbb9]">
            Enter the team password to open the food and drink study guide.
          </p>

          <form onSubmit={unlockGuide} className="mt-6 grid gap-3">
            <label className="grid gap-2 text-sm font-semibold">
              Password
              <input
                type="password"
                value={passwordInput}
                onChange={(event) => {
                  setPasswordInput(event.target.value);
                  setAccessError("");
                }}
                className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white outline-none ring-[#d9a760]/30 transition placeholder:text-white/35 focus:ring-4"
                placeholder="Enter password"
                autoComplete="current-password"
              />
            </label>

            {accessError && (
              <p className="rounded-2xl border border-red-300/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                {accessError}
              </p>
            )}

            <button
              type="submit"
              className="rounded-full bg-[#d9a760] px-6 py-3 text-sm font-bold text-[#17120d] transition hover:bg-[#efc276]"
            >
              Unlock Guide
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#10120f] text-[#f7f0e4]">
      <section className="relative overflow-hidden px-5 pb-16 pt-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(184,98,54,0.22),transparent_32%),linear-gradient(135deg,#10120f_0%,#1d221b_55%,#3b2f22_100%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#d9a760]">
              Bacari dinner study guide
            </p>
            <h1 className="mt-5 font-serif text-5xl leading-none md:text-7xl">
              Learn the menu by flavor, category, and service cue.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#d7cbb9]">
              A quick-study workspace for Bacari dinner items: cold plates, hot
              plates, pizza, sweets, drinks, dietary tags, and server memory
              hooks.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#cards"
                className="rounded-full bg-[#d9a760] px-6 py-3 text-sm font-bold text-[#14100c] transition hover:bg-[#efc276]"
              >
                Study Cards
              </a>
              <a
                href="#quiz"
                className="rounded-full border border-[#f7f0e4]/25 px-6 py-3 text-sm font-bold text-[#f7f0e4] transition hover:bg-white/10"
              >
                Practice Quiz
              </a>
              <a
                href={menuSourceUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-[#f7f0e4]/25 px-6 py-3 text-sm font-bold text-[#f7f0e4] transition hover:bg-white/10"
              >
                Official Menu
              </a>
            </div>
          </div>

          <div className="grid gap-4 rounded-[2rem] border border-white/10 bg-white/[0.07] p-5 shadow-2xl shadow-black/30 backdrop-blur">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl bg-black/25 p-4">
                <p className="text-3xl font-bold">{studyItems.length}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#d7cbb9]">
                  Cards
                </p>
              </div>
              <div className="rounded-2xl bg-black/25 p-4">
                <p className="text-3xl font-bold">{categories.length}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#d7cbb9]">
                  Sections
                </p>
              </div>
              <div className="rounded-2xl bg-black/25 p-4">
                <p className="text-3xl font-bold">90</p>
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#d7cbb9]">
                  Min bar
                </p>
              </div>
            </div>
            <div className="rounded-2xl bg-[#d9a760] p-5 text-[#17120d]">
              <p className="text-sm font-bold uppercase tracking-[0.18em]">
                Study focus
              </p>
              <p className="mt-3 text-2xl font-bold leading-tight">
                Know the proteins, sauces, dietary tags, and allergy callouts
                before memorizing every garnish.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#f7f0e4] px-5 py-5 text-[#16140f]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {(["All", ...categories] as const).map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                aria-pressed={activeCategory === category}
                className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                  activeCategory === category
                    ? "bg-[#16140f] text-white"
                    : "bg-[#e6d7c3] text-[#272118] hover:bg-[#d9c29f]"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setShowAnswers((current) => !current)}
            className="rounded-full border border-[#16140f]/15 px-4 py-2 text-sm font-bold"
          >
            {showAnswers ? "Hide Cues" : "Show Cues"}
          </button>
        </div>
      </section>

      <section id="cards" className="px-5 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#d9a760]">
                Menu cards
              </p>
              <h2 className="mt-3 font-serif text-4xl md:text-5xl">
                {activeCategory === "All" ? "Dinner overview" : activeCategory}
              </h2>
            </div>
            <p className="max-w-xl leading-7 text-[#c9bda9]">
              GF means gluten-friendly as listed <br/>
              V means vegan <br/>
              VP/GFP means a vegan or gluten-friendly preparation may be available. 
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((item) => (
              <article
                key={item.name}
                className="rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-5 shadow-xl shadow-black/20"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d9a760]">
                      {item.category}
                    </p>
                    <h3 className="mt-2 font-serif text-3xl leading-tight">
                      {item.name}
                    </h3>
                    <p className="mt-3 max-w-md text-sm font-semibold leading-6 text-[#d7cbb9]">
                      {item.tableTalk}
                    </p>
                  </div>
                  {item.price && (
                    <span className="rounded-full bg-[#d9a760] px-3 py-1 text-sm font-bold text-[#17120d]">
                      {item.price}
                    </span>
                  )}
                </div>

                <div className="mt-4 grid gap-3">
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#d9a760]">
                      Prep tags
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-semibold text-[#e8dbc8]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#d9a760]">
                      Allergies
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {item.allergens.map((allergen) => (
                        <button
                          key={`${item.name}-${allergen.name}`}
                          type="button"
                          onClick={() =>
                            setSelectedAllergen({
                              dish: item.name,
                              allergen,
                            })
                          }
                          className="rounded-full border border-[#d9a760]/40 bg-[#d9a760]/15 px-3 py-1 text-xs font-bold text-[#f7d59a] transition hover:border-[#d9a760] hover:bg-[#d9a760]/25"
                        >
                          {allergen.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {showAnswers && (
                  <div className="mt-5 grid gap-3 text-sm leading-6 text-[#d7cbb9]">
                    <div className="rounded-2xl bg-black/20 p-4">
                      <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#d9a760]">
                        Ingredients
                      </p>
                      <p>{item.cue}</p>
                    </div>
                    <div className="rounded-2xl border border-[#d9a760]/20 bg-[#d9a760]/10 p-4">
                      <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#d9a760]">
                        Substitutions
                      </p>
                      <ul className="grid gap-1">
                        {item.substitutions.map((substitution) => (
                          <li key={substitution}>{substitution}</li>
                        ))}
                      </ul>
                    </div>
                    <p className="rounded-2xl bg-black/25 p-4 font-semibold text-[#f5ddb4]">
                      {item.remember}
                    </p>
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="quiz" className="bg-[#f7f0e4] px-5 py-16 text-[#17120d]">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#8a5a1f]">
              Practice
            </p>
            <h2 className="mt-3 font-serif text-4xl md:text-5xl">
              Prompt yourself, then reveal the card.
            </h2>
            <p className="mt-4 leading-7 text-[#5e5345]">
              Use this for pre-shift repetition: name the category, protein,
              sauce, dietary tags, and the one guest-facing memory hook.
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-[#17120d]/10 bg-white p-6 shadow-2xl shadow-[#c6b18f]/35">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#8a5a1f]">
                  Flash prompt
                </p>
                <h3 className="mt-3 font-serif text-4xl">{quizItem.name}</h3>
              </div>
              <span className="rounded-full bg-[#17120d] px-4 py-2 text-sm font-bold text-white">
                {quizItem.category}
              </span>
            </div>

            <div className="mt-6 grid gap-3 rounded-2xl bg-[#f0e3cf] p-5">
              <p className="font-bold">Answer check</p>
              <p className="font-semibold">{quizItem.tableTalk}</p>
              <p className="leading-7 text-[#5e5345]">{quizItem.cue}</p>
              <div>
                <p className="font-bold">Substitutions</p>
                <ul className="mt-2 grid gap-1 text-[#5e5345]">
                  {quizItem.substitutions.map((substitution) => (
                    <li key={substitution}>{substitution}</li>
                  ))}
                </ul>
              </div>
              <p className="font-semibold">{quizItem.remember}</p>
              <div className="flex flex-wrap gap-2">
                {quizItem.allergens.map((allergen) => (
                  <button
                    key={`${quizItem.name}-${allergen.name}`}
                    type="button"
                    onClick={() =>
                      setSelectedAllergen({
                        dish: quizItem.name,
                        allergen,
                      })
                    }
                    className="rounded-full bg-white px-3 py-1 text-xs font-bold transition hover:bg-[#d9a760]"
                  >
                    {allergen.name}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={nextQuizItem}
              className="mt-5 rounded-full bg-[#d9a760] px-6 py-3 text-sm font-bold text-[#17120d] transition hover:bg-[#efc276]"
            >
              Next Card
            </button>
          </div>
        </div>
      </section>

      <section className="px-5 py-16">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#d9a760]">
            Pairing drills
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {pairings.map((pairing) => (
              <div
                key={pairing}
                className="rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-5 text-lg font-semibold leading-8 text-[#eadcc8]"
              >
                {pairing}
              </div>
            ))}
          </div>
          <p className="mt-8 max-w-3xl text-sm leading-6 text-[#bcae99]">
            Based on Bacari's official Playa Del Rey dinner menu page. Menus and
            prices can vary by location and date, so confirm with the official
            menu before service.
          </p>
        </div>
      </section>

      {selectedAllergen && (
        <div
          className="fixed inset-0 z-[2147483647] grid place-items-center bg-black/70 px-5 py-8 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="allergen-detail-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedAllergen(null);
            }
          }}
        >
          <section
            className="w-full max-w-lg rounded-[1.5rem] border border-white/10 p-6 shadow-2xl shadow-black/40"
            style={{ backgroundColor: "#f7f0e4", color: "#17120d" }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p
                  className="text-xs font-bold uppercase tracking-[0.2em]"
                  style={{ color: "#8a5a1f" }}
                >
                  {selectedAllergen.dish}
                </p>
                <h2
                  id="allergen-detail-title"
                  className="mt-2 font-serif text-4xl leading-tight"
                  style={{ color: "#17120d" }}
                >
                  {selectedAllergen.allergen.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAllergen(null)}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#17120d] text-lg font-bold text-white"
                aria-label="Close allergen detail"
              >
                x
              </button>
            </div>

            <div className="mt-6 grid gap-4">
              <div
                className="rounded-2xl p-4"
                style={{ backgroundColor: "#ffffff", color: "#17120d" }}
              >
                <p
                  className="text-xs font-bold uppercase tracking-[0.18em]"
                  style={{ color: "#8a5a1f" }}
                >
                  Where it is
                </p>
                <p className="mt-2 leading-7" style={{ color: "#17120d" }}>
                  {selectedAllergen.allergen.source}
                </p>
              </div>

              <div
                className="rounded-2xl p-4"
                style={{ backgroundColor: "#ffffff", color: "#17120d" }}
              >
                <p
                  className="text-xs font-bold uppercase tracking-[0.18em]"
                  style={{ color: "#8a5a1f" }}
                >
                  Modification
                </p>
                <p className="mt-2 leading-7" style={{ color: "#17120d" }}>
                  {selectedAllergen.allergen.modification}
                </p>
              </div>

              {selectedAllergen.allergen.caution && (
                <div
                  className="rounded-2xl border p-4"
                  style={{
                    backgroundColor: "#f1d6c5",
                    borderColor: "rgba(184, 98, 54, 0.25)",
                    color: "#17120d",
                  }}
                >
                  <p
                    className="text-xs font-bold uppercase tracking-[0.18em]"
                    style={{ color: "#8a3f20" }}
                  >
                    Service note
                  </p>
                  <p className="mt-2 leading-7" style={{ color: "#17120d" }}>
                    {selectedAllergen.allergen.caution}
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

export default BacariDinnerStudyGuide;
