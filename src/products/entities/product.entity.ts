
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImg } from "./product-img.entity";

@Entity() // Con este decorador indico que la clase sera usada como una entidad 
// con la propiedad Name puedo indicar el nombre que puede tener la taba en la bd
export class Product {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @Column('text', {
        unique: true,
    })
    title: string;

    @Column('float', {
        default: 0
    })
    price: number;

    @Column({
        type: 'text',
        nullable: true
    })
    descripcion: string

    @Column({
        unique: true,
    })
    slug: string;

    @Column('int', {
        default: 0
    })
    stock: number

    @Column('text', {
        array: true
    })
    sizes: string[];

    @Column('text')
    gender: string;

    @Column('text', {
        array: true,
        default: [] // Si no manda nada se define uno por defecto 
    })
    tags: string[];


    // Ya no se usa el column > no se considera columna sino una relacion 
    @OneToMany(
        () => ProductImg, // retornara un obj de tipo producimg
        (producimg) => producimg.product, // Indica como se relaciona ProductImg  con nuetra tabla (La columna que hace de relacion)
        {
            cascade: true,// esa opcion permite eliminar si existee una relacion con otra tabla 
            eager: true // permite que todos los metodos finde* de los repositorios cargen las relaciones 
        }
    )  // un producto puede tener muchas images Relacion
    imags?: ProductImg[]

    //indica que antes del insert ejecutar el metodo que checa el campo slug
    @BeforeInsert()
    /// @BeforeUpdate()
    checkSlugInsert() {
        if (!this.slug) {
            this.slug = this.title

        }
        this.slug = this.slug
            .toLowerCase()
            .replaceAll("'", "")
            .replaceAll(" ", "_")
    }

    @BeforeUpdate()
    checkSlugUpdate() {
        this.slug = this.slug
            .toLowerCase()
            .replaceAll("'", "")
            .replaceAll(" ", "_")
    }

}
// Representacion de una tabla de la bd

