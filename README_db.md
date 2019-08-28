# Database Docker configuration
> Explanation of the implementation of the Neo4j database on Docker. 

## docker-compose
You can use this yaml file to run an instance of Neo4j database. Check that you already have the appropriate plugins. Just drop the [apoc-3.5.0.3-all.jar](https://github.com/neo4j-contrib/neo4j-apoc-procedures/releases) and [graph-algorithms-algo-3.5.0.1.jar](https://github.com/neo4j-contrib/neo4j-graph-algorithms/releases) file inside your plugins folder.
```yaml
version: "2"
services:
  database:
    container_name: neo4j-bm
    image: neo4j:latest
    ports:
      - "7473:7473"
      - "7474:7474"
      - "7687:7687"
    environment:
      - NEO4J_dbms_security_procedures_unrestricted=algo.*,apoc.*
      - NEO4J_apoc_export_file_enabled=true
      - NEO4J_apoc_import_file_use__neo4j__config=true
      - NEO4J_apoc_import_file_enabled=true
      - NEO4J_dbms_shell_enabled=true
      - NEO4J_dbms_memory_heap_max__size=2G
      - NEO4J_dbms_memory_heap_initial__size=2G
    volumes:
      - $HOME/tourism-neo4j/plugins:/var/lib/neo4j/plugins
      - $HOME/tourism-neo4j/data:/var/lib/neo4j/data
      - $HOME/tourism-neo4j/import:/var/lib/neo4j/import
    networks:
      neo4tourism:
        ipv4_address: 172.23.0.2

networks:
  neo4tourism:
    driver: bridge
    ipam:
        config:
          - subnet: 172.23.0.0/29
            gateway: 172.23.0.1
```

## Dump database
You probably have a dump file from your old database or another database you want to use. Simply put it in the import folder and make sure that the targeted database is not running.

If you don't have the neo4j image already, pull it:
```bash
$ docker pull neo4j
```

Run the image in interactive mode in order to import your `.dump` file:
```bash
$ docker run \
--publish=7474:7474 --publish=7687:7687 \
--volume=$HOME/tourism-neo4j/data:/data \
--volume=$HOME/tourism-neo4j/import:/import \
-i -t neo4j /bin/bash
```

To load your file, the database system need to be shutdown inside the container and then you can load it with `bin/neo4j-admin` command:
```bash
bash-4.4$ bin/neo4j stop

bash-4.4$ bin/neo4j-admin load --from=/backups/graph.db/2018-06-14.dump --database=graph.db --force
bash-4.4$ exit
```

Stop and delete this container and run the docker-compose command with the previous file:
```bash
$ docker stop <container-id>
$ docker rm <container-id>

$ docker-compose up
```

## Network
The yaml file will create the __neo4tourism__ network based on the bridge driver. You can therefore use an IP address between __172.23.0.1__ and __172.23.0.6__. You will probably have several neo4j databases or other services in this context, then simply change the IP address and do not create a new network, an error will occur.

The API uses IP 172.23.0.3 and the dashboard 172.23.0.4.

```yaml
// docker-compose.yaml

version: "2"
services:
  database:
    container_name: neo4j-secondary
    image: neo4j:latest
    ports:
      - "7473:7473"
      - "7474:7474"
      - "7687:7687"
    environment:
      - NEO4J_dbms_security_procedures_unrestricted=algo.*,apoc.*
      - NEO4J_apoc_export_file_enabled=true
      - NEO4J_apoc_import_file_use__neo4j__config=true
      - NEO4J_apoc_import_file_enabled=true
      - NEO4J_dbms_shell_enabled=true
      - NEO4J_dbms_memory_heap_max__size=2G
      - NEO4J_dbms_memory_heap_initial__size=2G
    volumes:
      - $HOME/secondary-neo4j/plugins:/var/lib/neo4j/plugins
      - $HOME/secondary-neo4j/data:/var/lib/neo4j/data
      - $HOME/secondary-neo4j/import:/var/lib/neo4j/import
    networks:
      neo4tourism:
        ipv4_address: 172.23.0.5
networks:
  neo4tourism:
    external:
      name: stage_neo4tourism
```