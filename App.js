/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useState, useCallback, useEffect} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Pressable,
  Modal,
  TextInput,
  Dimensions,
  FlatList,
  Linking
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ShareMenu, { ShareMenuReactView } from "react-native-share-menu";
var {height, width} = Dimensions.get('window');

const App = () => {
  const [sharedData, setSharedData] = useState(null);
  const [storedCategories, setStoredCategories] = useState(null);
  const [linksData, setLinksData] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [category, setCategory] = useState("");

  const handleShare = useCallback((item) => {
    if (!item) {
      return;
    }

    const { mimeType, data, extraData } = item;
    let dataObj;
    if(data) {
      dataObj =  data.match(/(https?:\/\/[^\s]+)/g);
    }
    setModalVisible(false);
    if(dataObj) {
      setSharedData(dataObj[0]);
      if(dataObj) {
        setModalVisible(true);
      }
    }
  }, []);

  useEffect(() => {
    ShareMenu.getInitialShare(handleShare);
  }, []);
  

  useEffect(() => {
    const listener = ShareMenu.addNewShareListener(handleShare);

    return () => {
      listener.remove();
    };
  }, []);

  useEffect(() => {
    AsyncStorage.getItem("links").then((links) => {
      if(links && links.length > 0) {  
        setLinksData(JSON.parse(links));
        setStoredCategories(Object.keys(JSON.parse(links)));
      }  
    })
  }, [])

  const saveLink = () => {
    AsyncStorage.getItem("links").then((data) => {
      if(data !== null) {
        let categoryLinks = JSON.parse(data);
        let categories = Object.keys(categoryLinks);
        if(categories.length > 0 && categories.indexOf(category) > -1) {
          categories.forEach(savedCat => {
            if(savedCat === category) {
              categoryLinks[savedCat].push(sharedData);
              setStoredCategories(Object.keys(categoryLinks));
              setLinksData(categoryLinks);
            } 
          })
        } else {
          categoryLinks[category] = [];
          categoryLinks[category].push(sharedData);
          setStoredCategories(Object.keys(categoryLinks));
          setLinksData(categoryLinks);
        }
        AsyncStorage.setItem("links", JSON.stringify(categoryLinks))
      } else {
        let itemToSave = {};
        itemToSave[category] = [sharedData];
        setStoredCategories(Object.keys(itemToSave));
        setLinksData(itemToSave);
        AsyncStorage.setItem("links", JSON.stringify(itemToSave));
      }
      setModalVisible(false);
    })
  }

  const onLinkClick = (link) => {
    Linking.canOpenURL(link).then((supported) => {
      console.log("supported", supported);
      if (supported) {
        Linking.openURL(link);
      }
    });
  }

  const listHeader = () => {
    return (
      <View style={styles.savedLinks}>  
        <Text style={styles.savedLinkTitle}>
          Bookmark Links
        </Text>
      </View>
    )
  }

  return (
        <View>
          {storedCategories && storedCategories.length > 0 ? (
            <View style={styles.linksParent}>
              <FlatList
                data={storedCategories}
                keyExtractor={(item, index) => 'key'+index}
                ListHeaderComponent={listHeader}
                renderItem={({item}) => 
                  <View style={styles.categoryLink}> 
                    <View style={styles.category}>
                      <Text style={styles.categoryTitle}>{item}</Text>
                    </View>  
                    <View>
                      <FlatList
                        data={linksData[item]}
                        keyExtractor={(item, index) => 'key'+index}
                        renderItem={({item}) => 
                          <View style={styles.link}>
                            <Text onPress={() => onLinkClick(item)} style={styles.linkText}>
                              {item}
                            </Text>
                          </View>  
                        }
                      />  
                    </View>  
                  </View> 
                }
                
              />
            </View>  
          ): (
            <View style={styles.noData}>
              <Text style={styles.noDataText}>
                Your saved Categories and Links will start appearing here.
              </Text>
            </View>  
          )}       
          <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
              Alert.alert("Modal has been closed.");
              setModalVisible(!modalVisible);
            }}
          >
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <Text style={styles.categoryText}>Select the category for shared link</Text>
                <View>
                  <TextInput
                    placeholder="Enter the category"
                    style={styles.input}
                    onChangeText={setCategory}
                    value={category}
                  />
                </View>  
                <Pressable
                  style={styles.setCategory}
                  onPress={saveLink}
                >
                  <Text style={styles.setCatText}>Set Category</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        </View>

  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  savedLinks: {
    width: width,
    height: 40,
    backgroundColor: '#00DBDE',
    justifyContent: 'center',
  },
  savedLinkTitle: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700'
  },
  linksParent: {
    marginTop: 10
  },
  categoryLink: {
    padding: 10,
    margin: 10,
    borderWidth: 1,
    borderColor: '#000',
    alignItems:'center'
  },
  categoryTitle: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700'
  },
  category: {
    alignItems: 'center'
  },
  link: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#FFCC70'
  },
  linkText: {
    fontSize: 14,
    fontWeight: '700',
    textDecorationLine: 'underline'
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600'
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    width: width/2
  },
  setCategory: {
    width: width/2,
    backgroundColor: '#B721FF',
    padding: 10,
    alignItems: 'center'
  },
  setCatText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff'
  },
  noData: {
    marginTop: height/2.5,
    padding: 20,
    alignItems: 'center'
  },
  noDataText: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center'
  }
});

export default App;
