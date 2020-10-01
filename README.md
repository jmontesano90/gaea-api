Gaea

https://gaea.jmontesano90.vercel.app/

Thank you for using Gaea!

https://imgur.com/ymd3GMS

Gaea is a tool meant to help educate, and demonstrate the very basics of natural selection, evolution and mendelian genetics. This is accomplished by simulating three different plant species, and having them grow, mature, and reproduce in real time. This readme is aimed at explaining how it works.

With these two core concepts in mind you can start utilizing Gaea to witness how these things function in an environment! Gaea will spawn 3 species of plants (with randomized dna strands) randomly within the field, and they will grow and breed naturally! Generally the very beginning of the simulation is the most tumultuous with one or two species quickly being overtaken. This is an ideal time to see natural selection, as you can witness what traits succeed in real time.

API Endpoints

Authentication Route:
${config.API_ENDPOINT}/auth/${userName}
Returns user id. Supports Get requests

    ${config.API_ENDPOINT}/auth/login
    Logs user in, requires user_name and password.  Supports Post requests

    ${config.API_ENDPOINT}/auth/users
    Posts a new user, requires user_name and password.  Supports Post requests

DNA Route:
${config.API_ENDPOINT}/dna/users/${userId}
Returns all Custom DNA associated with user. Supports Get Request
\${config.API_ENDPOINT}/dna
Posts custom DNA strand, requires user_id, name, and DNA. Comment is optional. Supports post requests.

What's going on under the hood?

When a new simulation starts, several things are randomized. Each species is given 6 plants, and they spawn somewhere randomly in a 4\*4 grid. Each species is given 2 randomized strands of DNA, so 3 of each species has its own distinct dna strand. However, they all reference the same table. So for example, a red plant expressing dominant A will express it as positive 10, same as a blue plant who expresses dominant A. This was something I initially wanted to do differently. Initially I had each species have a series of base pairs (adenine thymine guanine cytosine ), and then those would be lumped into a generic gene, like A for example.

However I very quickly realized I was going to be displaying too much information to the user, so I instead simply made a dna library that the dna references and that's how traits are expressed. Initially, each species had its own unique DNA library, to differentiate them, but once again I realized I was asking far too much of people to try and follow, and for that same reason I removed genetic mutations.

So each species is randomly given 2 dna strands, that may look like this:
AaBbccdDeEfFGGHHIijjKkllmmNnoOpp
Then, the traits are expressed according to mendelian genetics. So if one, or both traits are dominant (upper case) the dominant trait expresses. If both are recessive (lower case) the recessive trait is expressed. The actual value for the trait can be seen in DnaHelper, the DnaKey.

    Every tile of the grid is given quite a bit of data, which is changed every “day” by the nearby plants.  So first every grid checks how plants are on it, and of what species.  Then it will check each plants DNA, and update itself according to their traits.  These traits affect how much a grid will negatively impact other species growth, how much they will promote their own species growth, how much they increase the chances of breeding in a grid and what species are in a grid.  Most importantly, it will then check around it to see how this grid is being affected by adjacent plants, and this value is saved.  This value is used for growth rate on this grid.

    After every grid is iterated over, now the plants begin to check themselves to see how they grow, and reproduce.  First, the plant checks how old it is, and how long it is meant to live by checking its DNA.  If it is not slated to die, it continues the checks.  Then the plant will “grow”.  The amount of biomass acquired per turn is governed by several values, first by its own growth rate, which is then added to the overall growth rate determined by the grid it’s on.

How much biomass a plant has is important, as it determines if a plant is mature to reproduce. Once the plant has reached a certain threshold, it will attempt to reproduce every turn. If two or more plants are mature in a single tile, they will attempt to reproduce. First the plant must pass a randomized check to see if they are going to reproduce this turn. Their random chance is determined by the following formula:

(plants genes that determining breeding chance) + (grids breeding influence chance) / 400)

    And this number must be greater than a simple Math.random() call in order for this individual plant to be given a chance at reproducing this turn.  If 2 or more individual plants on a tile pass these checks, they may now reproduce.  Their offspring are given one random gene for each trait, so if parent A is Mm, and parent B is mm, the offspring could only be either Mm, or mm.  Or if parent A is Mm, and parent B is Mm, their offspring could be MM, Mm, or mm.

    But where does our lovely bundle of joy go?  Well if there is room in the tile, the child will grow in the same tile as the parents.  However, if there are more than 4 plants in a grid, the offspring will attempt to migrate to a new tile.  The chance to migrate is based on the following formula:

    (total number of plants alive) / 80
    And In order to migrate this number must be greater than a Math.random() call.  If it does succeed, it will pick up, down, left or right randomly.  It will then check if that grid is either the same species, or an empty grid.  If one of those is true, it will migrate there,  if not the offspring does not grow.

    The chance to migrate purpose is a quick and dirty method of simulating resource scarcity.  As more plants appear, the chance to grow becomes slimmer, approximating the idea that resources are limited.  What I initially intended to do was have each tile have a set amount of nitrogen in the soul, and the plants grew they took the nitrogen in.  Once the plants died they would release that nitrogen back into the ground.  However I wasn’t sure how to display this properly to users and eventually decided against it.  However I do want to come back to this and update this feature in, even if only having it operate in the background.

Custom DNA

The custom DNA form operates more or less how it claims to on the page. You generate a DNA strand, and it's given to ALL red plants. The only difference here is that now the red dna only gets one strand as opposed to two! It’s important to remember that due to this, your custom designed plant has little flexibility in terms of evolving!
