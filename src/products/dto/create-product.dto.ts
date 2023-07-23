import { IsString, MinLength, IsNumber, IsPositive, IsOptional, IsInt, IsArray, IsIn } from "class-validator"

export class CreateProductDto {
    @IsString()
    @MinLength(1)
    title: string;

    @IsNumber()
    @IsPositive()
    @IsOptional()
    price?: number;

    @IsOptional()
    @IsString()
    descripcion?: string;

    @IsOptional()
    @IsString()
    slug?: string;

    @IsInt()
    @IsPositive()
    stock?: number;

    @IsString({ each: true })
    @IsArray()
    sizes: string[];

    @IsIn(['men', 'women', 'unisex'])
    gender: string;

    @IsString({ each: true })
    @IsArray()
    @IsOptional()
    tags?: string[];

    @IsString({ each: true })
    @IsArray()
    @IsOptional()
    imags?: string[]; // este nombre debe ser igual que el de la entidad del product




}
