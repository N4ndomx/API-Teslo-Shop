import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./product.entity";

@Entity()
export class ProductImg {
    @PrimaryGeneratedColumn() // por defecto sera autoincremental
    id: number;
    @Column('text')
    url: string;
    @ManyToOne(
        () => Product,
        (product) => product.imags,
        {
            onDelete: "CASCADE"   // indico que quiero que suceda cuando se elimina un producto
        }
    ) // muchas imagenes pueden tener un unico producto 
    product: Product

}
// Asi sola es un archivo hay que indicarle a typeorm qu existe una nueva entidad
