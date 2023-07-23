import { Type } from "class-transformer";
import { IsOptional, IsPositive, Min } from "class-validator";

export class PaguinacionDTO {
    @IsOptional()
    @IsPositive()
    // Transformar
    @Type((() => Number)) // eneableImplicitConversions =true 
    limit?: number

    @IsOptional()
    // @IsPositive() <- no detecta numeros positivos 
    @Min(0)
    @Type((() => Number)) // eneableImplicitConversions =true 
    offset: number
}