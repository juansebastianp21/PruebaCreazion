import React,{Component} from 'react'
import {View, Text, FlatList, Image, StyleSheet, TextInput} from 'react-native'
import _ from 'lodash'
export default class ApiList extends Component{
    
    state={
        loading:false,
        pokemon:[],
        url: 'https://pokeapi.co/api/v2/pokemon/?limit=200',
        seachPokemon: [],
        query:'',
    }

    componentDidMount(){
        this.getPokemon();
    }

    getPokemon = () => {
        this.setState({loading:true})
        fetch(this.state.url)
        .then(res => res.json())
        .then(jsonRes => {
            this.setState({
                pokemon: jsonRes.results,
                url: jsonRes.next,
                loading: false,
                seachPokemon: jsonRes.results,
            })
        })
    }

    item = ({item}) => {
        return(
            <View style={styles.itemContainer}>
                <Text style={styles.itemText}>
                    {item.name}
                </Text>
            </View>
        )
    }

    header = () => {
        return(
            <View style={styles.searchBarContainer}>
                <TextInput
                onChangeText={this.handleSearch}
                />
            </View>
        )
    }

    handleSearch = (text) => {
        const formatedQuery = text.toLowerCase()
        const data = _.filter(this.state.pokemon, pokemon => {
            if(pokemon.name.includes(formatedQuery)){
                return true
            }
            return false
        })
        this.setState({
            seachPokemon:data,
            query: text
        })
    }


    render(){
        if(this.state.loading){
            return(
                <View style={styles.container}>
                    <Text>Cargando</Text>
                </View>
            )
        }
        return(
            <View style={styles.container}>
                <FlatList
                style={styles.flat}
                data={this.state.seachPokemon}
                renderItem={this.item}
                ListHeaderComponent={this.header}
                />
            </View>
        )
    }
}


const styles = StyleSheet.create({
    container:{
        flex:1,
        justifyContent:'center',
        alignItems:'center'
    },
    flat:{
        width:'100%'
    },
    itemContainer:{
        alignSelf:'center',
        width:'90%',
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
        marginVertical: 5
    }
})
