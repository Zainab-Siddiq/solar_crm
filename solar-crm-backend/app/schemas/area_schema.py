from pydantic import BaseModel

class AreaCreate(BaseModel):

    city : str
    area_name : str