<img src="https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/160/apple/81/airplane_2708.png" align=right height=80>

# Tourism API
> REST API to query Neo4J Tourism Database

<!-- @import "[TOC]" {cmd="toc" depthFrom=1 depthTo=2 orderedList=false} -->

<!-- code_chunk_output -->

- [Tourism API](#tourism-api)
  - [Endpoints](#endpoints)
    - [Database statistics](#database-statistics)
    - [National context](#national-context)
    - [International context](#international-context)
    - [Destination context](#destination-context)
- [Database statistics](#database-statistics-1)
  - [Show number of users/reviews per year](#show-number-of-usersreviews-per-year)
    - [Success Response Content Example](#success-response-content-example)
  - [Show number of users/reviews per year and for given country](#show-number-of-usersreviews-per-year-and-for-given-country)
    - [Success Response Content Example](#success-response-content-example-1)
  - [Show number of users/reviews per year and for given country & dep](#show-number-of-usersreviews-per-year-and-for-given-country--dep)
    - [Success Response Content Example](#success-response-content-example-2)
- [National context](#national-context-1)
  - [Ingoing/Outgoing evolution information per year](#ingoingoutgoing-evolution-information-per-year)
    - [Success Response Content Example](#success-response-content-example-3)
  - [Info available for national request](#info-available-for-national-request)
    - [Success Response Content Example](#success-response-content-example-4)
- [International context](#international-context-1)
  - [Reviews evolution information per year](#reviews-evolution-information-per-year)
    - [Success Response Content Example](#success-response-content-example-5)
  - [Info available for international request](#info-available-for-international-request)
    - [Success Response Content Example](#success-response-content-example-6)
- [Destination context](#destination-context-1)
  - [Ingoing/Outgoing evolution information per year](#ingoingoutgoing-evolution-information-per-year-1)
    - [Success Response Content Example](#success-response-content-example-7)
  - [Info available for destination request](#info-available-for-destination-request)
    - [Success Response Content Example](#success-response-content-example-8)

<!-- /code_chunk_output -->

## Endpoints

### Database statistics

- [Show number of users/reviews per year](#show-number-of-usersreviews-per-year) : `GET /:city/stats/`
- [... and for a given country](#show-number-of-usersreviews-per-year-and-for-given-country) : `GET /:city/stats/:country`
- [... and for a given department](#show-number-of-usersreviews-per-year-and-for-given-country-dep) : `GET /:city/stats/:country/:dep`

### National context

- [Ingoing/Outgoing evolution information per year](#reviews-evolution-information-per-year) : `GET /:city/national/:year`
- [Info available for national request](#info-available-for-national-request) : `GET /:city/national/:year/info`

### International context

- [Reviews evolution information per year](#number-of-reviews-per-country-for-a-given-year) : `GET /:city/international/:year`
- [Info available for international request](#info-available-for-international-request) : `GET /:city/internnational/:year/info`

### Destination context

- [Ingoing/Outgoing evolution information per year](#ingoingoutgoing-evolution-information-per-year-1) : `GET /:city/destination/:year/:from/:groupby`
- [Info available for grouping request](#info-available-for-destination-request) : `GET /:city/destination/:year/:from/:groupby/info`

# Database statistics

## Show number of users/reviews per year

|                  |                 |
| ---------------- | --------------- |
| **URL**          | `/:city/stats/` |
| **Method**       | **GET**         |
| **Success Code** | 200             |

### Success Response Content Example

```json
{
  "2010": {
    "year": 2010,
    "users": "12 929",
    "reviews": "42 687"
  },
  "2011": {
    "year": 2011,
    "users": "24 084",
    "reviews": "112 358"
  }
  ...
}
```

## Show number of users/reviews per year and for given country

|                    |                                                    |
| ------------------ | -------------------------------------------------- |
| **URL**            | `/:city/stats/:country`                            |
| **Method**         | **GET**                                            |
| **Success Code**   | 200                                                |
| **URL Parameters** | \* `country=[string]` : stats of specific country. |

### Success Response Content Example

```json
{
  "2010": {
    "year": 2010,
    "users": "12 929",
    "reviews": "42 687",
    "France": "6 283"
  },
  "2011": {
    "year": 2011,
    "users": "24 084",
    "reviews": "112 358",
    "France": "20 283"
  }
  ...
}
```

## Show number of users/reviews per year and for given country & dep

|                    |                                                    |
| ------------------ | -------------------------------------------------- |
| **URL**            | `/:city/stats/:country/:dep`                       |
| **Method**         | **GET**                                            |
| **Success Code**   | 200                                                |
| **URL Parameters** | \* `country=[string]` : stats of specific country. |
|                    | \* `dep=[string]` : stats of specific department.  |

### Success Response Content Example

```json
{
  "2010": {
    "year": 2010,
    "users": "12 929",
    "reviews": "42 687",
    "France": "6 283"
  },
  "2011": {
    "year": 2011,
    "users": "24 084",
    "reviews": "112 358",
    "France": "20 283"
  }
  ...
}
```

# National context

## Ingoing/Outgoing evolution information per year

|                    |                                                                       |
| ------------------ | --------------------------------------------------------------------- |
| **URL**            | `/:city/national/:year`                                               |
| **Method**         | **GET**                                                               |
| **Success Code**   | 200                                                                   |
| **URL Parameters** | \* `year=[number]` : evolution year.                                  |
|                    | `countries=[array[string]]` : evolution for these user nationalities. |
|                    | `departments=[array[string]]` : evolution for these departments.      |
|                    | `ages=[array[string]]` : evolution for these user age ranges.         |
|                    | `top=[number]` : top parameter for neo4j query.                       |

### Success Response Content Example

```json
{ 
  "Centrality":{
    "Gironde": {
      "2017": {
          "value": 2.08
      },
      "2018": {
          "value": 2.09
      },
      "diff": {
          "value": 0.01
      }
    },
    ...
  },
  "TotalReviews":{
    "2017": {
      "NB1": 63948,
      "NB2": 62352,
      "Year": 2017
    },
    "2018": {
      "NB1": 47626,
      "NB2": 47958,
      "Year": 2018
    },
    "diff": ...
      ...
  },
  "Evolution": {
    "Gironde": {
      "2017": {
          "Ingoing": 9.41,
          "Outgoing": 10.42
      },
      "2018": {
          "Ingoing": 10.52,
          "Outgoing": 9.82
      },
      "diff": {
          "Ingoing": 1.11,
          "Outgoing": -0.6
      }
    },
    ...
  },
  {
    "Monthly": {
      "Gironde": {
        "Ingoing": {
          "months": [
            {
              "low": 156,
              "high": 0
            },
          ]
        },
        "Outgoing":...
      },
    }
  }
}
```

## Info available for national request

|                    |                                      |
| ------------------ | ------------------------------------ |
| **URL**            | `/:city/national/:year/info`         |
| **Method**         | **GET**                              |
| **Success Code**   | 200                                  |
| **URL Parameters** | \* `year=[number]` : evolution year. |

### Success Response Content Example

```json
{
  "topRegions": ["Centre", "Bretagne", "Limousin",...],
  "topCountries": ["France", "-", "Belgium",...],
  "topAges": ["13-17", "", "18-25",...]
}
```

# International context

## Reviews evolution information per year

|                    |                                                                      |
| ------------------ | -------------------------------------------------------------------- |
| **URL**            | `/:city/international/:year`                                         |
| **Method**         | **GET**                                                              |
| **Success Code**   | 200                                                                  |
| **URL Parameters** | \* `year=[number]` : evolution year.                                 |
|                    | `countries=[array[string]]` :evolution for these user nationalities. |
|                    | `areas=[array[string]]` : evolution for these areas.                 |
|                    | `ages=[array[string]]` : evolution for these user age ranges.        |
|                    | `top=[number]` : top parameter for neo4j query.                      |

### Success Response Content Example

```json
{
  "TotalReviews":{
    "2012": {
      "NB1": 22597,
      "Year": 2012
    },
    "2013": {
      "NB1": 48273,
      "Year": 2013
    },
    "diff": {
      "NB1": 113.63
    }
  },
  "Evolution": {
    "France": {
      "2015": 57.84,
      "2016": 55.78,
      "diff": -2.06
    },
    "-": {
      "2015": 31.21,
      "2016": 34.07,
      "diff": 2.86
    },
  },
  "Monthly": {
    "France": {
      "Reviews": {
        "months": [
          {
            "low": 5840,
            "high": 0
          },
          ..
        ]
      }
    }
  }
}
```

## Info available for international request

|                    |                                      |
| ------------------ | ------------------------------------ |
| **URL**            | `/:city/international/:year/info`    |
| **Method**         | **GET**                              |
| **Success Code**   | 200                                  |
| **URL Parameters** | \* `year=[number]` : evolution year. |

### Success Response Content Example

```json
{
  "topCountries": ["France", "-", "Belgium",...],
  "topAges": ["13-17", "", "18-25",...]
}
```

# Destination context

## Ingoing/Outgoing evolution information per year

|                    |                                                                        |
| ------------------ | ---------------------------------------------------------------------- |
| **URL**            | `/:city/destination/:year/:from/:groupby`                              |
| **Method**         | **GET**                                                                |
| **Success Code**   | 200                                                                    |
| **URL Parameters** | \* `year=[number]` : evolution year.                                   |
|                    | \* `from=[number]` : perimeter for neo4j query.                        |
|                    | \* `groupby=[number]` : for this perimeter, groupby regions, dep, etc. |
|                    | `countries=[array[string]]` : evolution for these user nationalities.  |
|                    | `areas=[array[string]]` : evolution for these areas.                   |
|                    | `ages=[array[string]]` : evolution for these user age ranges.          |
|                    | `top=[number]` : top parameter for neo4j limit aggregate.              |

### Success Response Content Example

```json
{
  "Centrality":{
    "Bordeaux": {
      "2016": {
        "value": 2.43
      },
      "2017": {
        "value": 2.54
      },
      "2018": {
        "value": 2.51
      },
      "diff": {
        "value": -0.03
      }
  },
    ...
  },
  "TotalReviews":{
    "2016": {
      "NB1": 4906,
      "Year": 2016
    },
    "2017": {
      "NB1": 3960,
      "Year": 2017
    },
    "2018": {
      "NB1": 3031,
      "Year": 2018
    },
    "diff": {
      "NB1": -23.46
    }
  },
  "Evolution": {
    "Bordeaux": {
      "2016": {
        "Ingoing": 17.24,
        "Outgoing": 17.47
      },
      "2017": {
        "Ingoing": 13.38,
        "Outgoing": 24.42
      },
      "2018": {
        "Ingoing": 10.89,
        "Outgoing": 25.4
      },
      "diff": {
        "Ingoing": -2.49,
        "Outgoing": 0.98
      }
    },
    ...
  },
  {
    "Monthly": {
     "Bordeaux": {
        "Ingoing": {
          "months": [
            {
              "low": 93,
              "high": 0
            },
          ]
        },
        "Outgoing":...
     }
  }
}
```

## Info available for destination request

|                    |                                                                        |
| ------------------ | ---------------------------------------------------------------------- |
| **URL**            | `/:city/destination/:year/:from/:groupby/info`                         |
| **Method**         | **GET**                                                                |
| **Success Code**   | 200                                                                    |
| **URL Parameters** | \* `year=[number]` : evolution year.                                   |
|                    | \* `from=[number]` : perimeter for neo4j query.                        |
|                    | \* `groupby=[number]` : for this perimeter, groupby regions, dep, etc. |

### Success Response Content Example

```json
{
  "topCountries": ["France", "-", "Belgium",...],
  "topAreas": ["Bordeaux",...],
  "topAges": ["13-17", "", "18-25",...]
}
```
