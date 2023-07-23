import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from "@nestjs/typeorm";
import { Product } from './entities/product.entity';
import { DataSource, Repository } from 'typeorm';
import { PaguinacionDTO } from 'src/common/dto/paginacion.dto';
import { validate as Isuuid } from "uuid";
import { ProductImg } from './entities';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService');

  constructor(
    // repositorios para crear obj y asig a la db
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImg)
    private readonly productImgRepository: Repository<ProductImg>,
    //
    private readonly dataSourse: DataSource  // se necesita apara el query runer porque conoce la cadena de ejecucion que estoy usando 
  ) { }

  async create(createProductDto: CreateProductDto) {
    try {
      // en ves de hacer la validacion del aqui slug (linkespcial)
      //realiza atraves de la entidad con un decorador especial @Before

      // enves de tener el codigo aqui 
      const { imags = [], ...dataextra } = createProductDto;
      const product = this.productRepository.create({
        ...dataextra,
        // Se espesifica que el arreglo no solo es de strings sino de objs del tipo productImg y lo logramos con repository
        imags: imags.map(img => this.productImgRepository.create({ url: img })),
      }) // Solo crea una instacia del produc con las propied
      await this.productRepository.save(product) // Registra la instacia en la base de datos 
      return { ...product, imags }
    } catch (error) {
      this.handleDBexceptions(error)
    }
  }
  // TODO: paginacion 
  async findAll(paginacionDto: PaguinacionDTO) {
    const { offset = 0, limit = 10 } = paginacionDto // otorga valores por defecto si no se otorgaron 
    const data = await this.productRepository.find({
      take: limit, // el limite de objs a mostrar 
      skip: offset, // desde donde va a iniciar a mostrar 
      // relations: { // indica que muestre los datos de la relaciones existentes 
      //   imags: true
      // }
      // comente lo anterior porque con la sentencia eger que coloque en la relacion de la entidad del producto
      // ya caraga las reaciones sin necesidad de colocar este pesazo de codigo 
      // TODO: relaciones 
    });

    return data.map(produc => ({ // se esta reordenando la data para solo enviar los links 
      ...produc,
      imags: produc.imags.map(img => img.url)
    }))
  }

  async findOne(term: string) {

    let product: Product
    if (Isuuid(term)) {
      product = await this.productRepository.findOneBy({ id: term });
    } else {
      // Construyo mi propia query 
      // Es sensible a las busquedas
      const query = this.productRepository.createQueryBuilder('prod')
      product = await query
        .where('title ILIKE :title or slug =:slug',
          { title: term, slug: term.toLowerCase() })
        .leftJoinAndSelect('prod.imags', 'prodImags')
        .getOne();

    }
    // const data = await this.productRepository.findOneBy({ id });
    if (!product) throw new NotFoundException(`no encontre `);
    return product
  }
  async findOnePlane(term: string) {
    const { imags = [], ...dataext } = await this.findOne(term);
    return {
      dataext,
      imags: imags.map(img => img.url)
    }
  }


  async update(id: string, updateProductDto: UpdateProductDto) {

    const { imags, ...rest } = updateProductDto

    const produc = await this.productRepository.preload({ // Busca un producto con esas caracteristicas y lo update "creo"
      id: id,
      ...rest
    }); // esta instruccion no carga las relaciones // recuerda que imags son una relacion no una tabla 

    if (!produc) throw new NotFoundException(`no encontre `);

    const queryRuner = this.dataSourse.createQueryRunner() // Puede ejecutar varias instrucciones sql que impactaran la bd pero si alg falla
    // puede crear bckup de la bd  | Create query runer | No ejecuta los cambios hasta que yo le indique con un commit
    await queryRuner.connect() //Inicia coneccion a la bd
    await queryRuner.startTransaction()
    try {

      if (imags) {
        // si en la update hay img se tiene q eliminar las enteriores y cargar las nuevas 
        await queryRuner.manager.delete(ProductImg, { product: { id } }) // Primero va la entity que quiero afectar y despues el criterio como objeto 
        produc.imags = imags.map(img => this.productImgRepository.create({ url: img })) // en los create se manda un objeto
        // Lo anterior no impacta la bd aun
      } else {
        // si no hay se tiene que mantener las img que hay o que no hay 
        // produc.imags = await this.productImgRepository.findBy({ product: { id } })

        // es una opcion para cargar las img y mostrarlas otra es cargar el producto por el id 
        // con el metodo this.findOnePlane

      }
      await queryRuner.manager.save(produc) // Apesar de usar save aun q no impactamos la bd , falta el commit o revertir si alg salio mal 
      //  queryRuner.manager no impacta la bd 

      // await this.productRepository.save(produc); // aunque sea promesa , el controlador se espera 
      await queryRuner.commitTransaction() // Inicia el impacto a bd con el save y delete  
      await queryRuner.release()// cierra conexion a bd 
      // return produc
      return this.findOnePlane(id)

    } catch (error) {
      queryRuner.rollbackTransaction() // revierte cambios en caso de error
      queryRuner.release()
      this.handleDBexceptions(error)
    }
  }

  async remove(id: string) {
    // asi encontre 
    //await this.productRepository.delete({ id });

    // Cuando ya tenemos relaciones podenos tener un erro 5000 por violar llaves foraneas 
    // entonces para eliminar tenemos de dos 
    // Usar una transaccion para eliminar de la primera relacion y despyes la tabla principal 
    // o eliminar por cascada cosa que debe configurarse en la entidad productImg

    const data = await this.findOne(id);
    await this.productRepository.remove(data);
  }

  private handleDBexceptions(error: any) {
    // console.log(error.code)
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    this.logger.error(error);
    throw new InternalServerErrorException('Error revisar consola ');
  }

  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('product')
    try {
      return await query.delete().where({}).execute()

    } catch (error) {
      this.handleDBexceptions(error)

    }
  }
}
