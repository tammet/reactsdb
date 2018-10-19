REST API specification
=======================

Here we describe the main overall principles of the api. 


Overall REST API principles
---------------------------

#### Authentication

Most REST API requests require `OAuth2` compatible authentication information provided in the request. This means that
request should contain HTTP request header `Authorization` or `X-Authorization`. Header should be presented in form:

```text
X-Authorization: Bearer {token}
```

Where `{token}` represents the token value returned by the server during the authentication process.

For development purposes you can alternatively pass the token in the GET url like this:
```
curl 'http://127.0.0.1:5000/api/nodes?token=test&limit=2
```
Moreover, in the development mode the token value "test" grants superuser rights.

#### Response

Response body will be returned in JSON format. Response code can be any of standard HTTP response codes. 

Important headers: 
* the `Content-type header` is always `application/json` except when serving the network map file.
* the CORS `Access-Control-Allow-Origin` is always `*` 

#### Error response

In case of reqest processing errors the response status code is either `4xx` or `5xx` and 
response body contains JSON object with the following structure:

```json
{
  "error": {
    "status": statusCode,
    "description": description,
    "reason": reason,
    "internalDescription": internalDescription,
    "trace": trace
  }
}
```

The elements of error structure:

* `status` - Error code. Same code as returned in HTTP response status line.
* `description` - Human readable error description meant to be displayed to the end user.
* `reason` - Internal machine-readable error reason specification. This is used but the calling software to identify the exact error 
  reason.
* `internalDescription` - Technical error description meant to be read by the IT support persons.
* `trace` - Server call stack dump for identifying the exact position in server source code where the error occured. 
  Only present in case the server runs in debug mode.  


Resource methods
-----------------

Server supports 5 types of requests:

1. Reading the collection of the resources
2. Reading the content of the one resource
3. Inserting new resource
4. Updating the resource
5. Deleting the resource


### Reading the collection of the resources

#### Request

Request should be made as HTTP `GET` method request to the URL:

```
https://{server}/api/{resource}?params...
```

There `{resource}` should be resource name and request can contain additional parameters for specifying 
resource collection filtering and sorting details.

There are some global optional parameters available for all resources:

* `start` - Value should be non-negative integer and specifies sequence number of the first returned resource (starting from 0).
* `limit` - Value should be non-negative integer and specifies maximum number of returned resources. If this parameter
  is missing or if the value is 0, then maximum of 100 resources will be returned.
* `sort` - Specifies sort order of the returned resources. Should contain the list of the resource field names, separated
  with the symbol ','. If field name contains symbol `-` before it then this means that sorting will be in descending 
  order, otherwise sorting is in ascending order.
* `fields` - Specifies the specific fields to be returned (default is all fields), in the comma-separated format 
```
fields={fieldName1},...,{fieldNameN}
```
* `filter` - Specifies filtering conditions. Format is a comma-separated list of triples, interpreted with AND:

```
filter={fieldName1},{operator1},{value1},...,{fieldNameN},{operatorN},{valueN}
```

where:

* `{fieldNameX}` - Resource field name.
* `{operatorX}` - Operator specifying filtering condition. Can be one of the following:
   - `=` - Resource field value should be exactly equal to the provided value
   - `<` - Resource field value should be less than provided value
   - `<=` - Resource field value should be less or equal than provided value
   - `>` - Resource field value should be greater than provided value
   - `>=` - Resource field value should be greater or equal than provided value
   - `!=` - Resource field value should be not equal to the provided value
   - `like` - Resource field value should contain provided value case-sensitively (in case of textual values)
   - `ilike` - Resource field value should contain provided value case-insensitively (in case of textual values)
* `{valueX}` - Provided value for filtering expression, For like and ilike operators it can contain the SQL wildcard characters %. Without the wildcard % the like operator performs the simple equality test, not the general containment test.

Field name, operator and value should be URI-encoded. Here are some ilike operator examples for use with curl:

```
curl 'http://127.0.0.1:5000/api/nodes?filter=notes,ilike,%25desc%25'  # filter value %desc% urlencoded
curl 'http://127.0.0.1:5000/api/nodes?filter=notes,ilike,%25a%25'  # filter value %a% urlencoded
curl 'http://127.0.0.1:5000/api/nodes?filter=notes,ilike,%25%2c%25' # cannot have urlencoded comma (2c)!!
curl 'http://127.0.0.1:5000/api/nodes?filter=not%65s,ilike,%25a%25'  # e urlencoded in fieldname notes
curl 'http://127.0.0.1:5000/api/nodes?filter=notes%2Cilike,'%25desc%25'' # , is urlencoded after notes

```

Alternatively, you can post the same parameters in the message as a json object, inside a key `query` like this: 

```json
{
  "query": {
    "op": "countedlist",
    "resource": "networks",
    "token": "test",
    "start": 0,
    "limit": 50,    
    "fields": ["id","name"],
    "filter": "id,<,1000"
    ...
  }
}

#### Response

Response is JSON object with the structure:


```json
{
  "resourceCollection": {
    "@start": start,
    "@limit": limit,
    "@total": total,
    "@estimated": estimated,
    "resource": {
      ...
    },
    ...
  }
}
```

Response element `resourceCollection` contains the following elements:

* `@start` - Value is integer and specifies sequence number of the first returned resource (starting from 0). Usually 
  it is the same as value in the request field `start`, but in cases when server decides to return resources from 
  defferent sequence range (e.g. when resource count is smaller than requested `start` value) the value can be different.
* `@limit` - Requested resource count or if the `limit` parameter were missing in request then this parameter should 
  contain actual applied limit for the request. This element can be missing if there were no record limit applied to the 
  response.
* `@total` - Total number of resources corresponding to specified filter fields (excluding parameters `start` and `limit`).
  If there were no filter fields then count of all resources. This element can be missing if the exact count is too 
  costly for the server to calculate. In that case the element `@esitmated` will be presented.
* `@estimated` - Estimated number of resources corresponding to specified filter fields 
  (excluding parameters `start` and `limit`). This element is missing if `@total` element is presented.
* `resource` - There can be zero to many `resource` elements. Each element corresponds to one returned resource. Element
  value is a JSON object that contains resource fields and field values.


### Reading the content of the one resource

#### Request

Request should be made as HTTP `GET` method request to the URL:

```
https://{server}/api/{resource}/{id}
```

URL component `{resource}` should be resource name and `{id}` should be resource ID.

#### Response

Response is JSON object with the structure

```json
{
  "resource": {
    ...
  }
}
```

Response element `resurce` value is a JSON object that contains resource fields and field values.

### Inserting new resource

#### Request

Request should be made as HTTP `POST` method request to the URL:

```
https://{server}/api/{resource}
```

URL component `{resource}` should be resource name.

Request content should be JSON object with the structure:

```json
{
  "resource": {
    ...
  }
}
```

Element `resurce` value is a JSON object that contains resource fields and field values.

#### Response

If there was no changes to the resource object during the insert then response can be with the status code `204` and 
without the response body. Otherwise the response code is `201` and response body contains the newly created resource (
the same content when requested with the `GET` method).

### Updating the resource

#### Request

Request should be made as HTTP `PUT` method request to the URL:

```
https://{server}/api/{resource}/{id}
```

URL component `{resource}` should be resource name and `{id}` should be resource ID.

Request content should be JSON object with the structure:

```json
{
  "resource": {
    ...
  }
}
```

Element `resurce` value is a JSON object that contains resource fields and field values.

#### Response

If there was no changes to the resource object during the insert then response can be with the status code `204` and 
without the response body. Otherwise the response code is `200` and response body contains updated resource (
the same content when requested with the `GET` method).

### Deleting the resource

#### Request

Request should be made as HTTP `DELETE` method request to the URL:

```
https://{server}/api/{resource}/{id}
```

URL component `{resource}` should be resource name and `{id}` should be resource ID.

Request body should be empty

#### Response

Response status code should be `200` and response body should be empty.


