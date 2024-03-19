const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Calculate minimum cost based on input quantities
function calculateMinimumCost(order) {

    var totalCosts = [];

    const centers = {
        C1: {
            distance: {
                C2: 4,
                L1: 3
            },
            products:{
                A:3,
                B:2,
                C:8
            },
            weight: 0
        },
        C2: {
            distance: {
                C1:4,
                C3:3,
                L1:2.5
            },
            products:{
                D:12,
                E:25,
                F:15
            },
            weight: 0
        },
        C3: {
            distance: {
                C2:3,
                L1:2
            },
            products:{
                G:0.5,
                H:1,
                I:2
            },
            weight: 0
        },
        L1:{
            distance: {
                C1:3,
                C2:2.5,
                C3:2
            },
            weight: 0
        }
    };

    for (const [key, value] of Object.entries(order)) {
        if(key in centers.C1.products)
        {
            centers.C1.weight += (centers.C1.products[key] * value);
        }
        else if(key in centers.C2.products)
        {
            centers.C2.weight += (centers.C2.products[key] * value);
        }
        else if(key in centers.C3.products)
        {
            centers.C3.weight += (centers.C3.products[key] * value);
        }
    }

    for (const [center, obj] of Object.entries(centers))
    {   
        if(obj.weight == 0)
        {
            continue;
        }
        else{
            visit(center, obj, {}, [], 0);
        }
    }

    function visit(center, obj, cost, visited, weight)
    {
        visited.push(center);
        weight += obj.weight;
        
        for (const [current, obj2] of Object.entries(obj.distance))
        {   
            if(current != "L1" && visited.indexOf(current) != -1)
            {
                continue;
            }

            var tmpcost = obj2 * 10;
            var addcost = (weight > 5)?Math.ceil((weight - 5) / 5) * 8 * obj2:0;
            cost[center+current] = (tmpcost + addcost);
            
            if(current == "L1" && (visited.indexOf("C1") != -1 || centers.C1.weight == 0) && (visited.indexOf("C2") != -1 || centers.C2.weight == 0) && (visited.indexOf("C3") != -1 || centers.C3.weight == 0))
            {
                visited.push(current);
                tmp = 0;
                for(i=1; i < visited.length; i++)
                {
                    if(visited[i-1]+visited[i] in cost)
                    {
                        tmp += cost[visited[i-1]+visited[i]];
                    }
                }

                totalCosts.push(tmp);
                cost = [];
                visited = [];
                return 1;
            }
            else if(current == "L1"){
                weight = 0;
            }
            
            visit(current, centers[current], cost, [...visited], weight);
        }
    }

    var totalCost = Math.min.apply(Math, totalCosts);

    return totalCost;
}
  

// API endpoint to calculate minimum cost
app.post('/calculate-minimum-cost', (req, res) => {
  const productQuantities = req.body;
  const minimumCost = calculateMinimumCost(productQuantities);
  res.json({ minimumCost });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
