package main

import (
  "fmt"
  "http"
  "io/ioutil"
  "os"
)

type Page struct {
  Title string
  Body []byte
}

func (page *Page) save() os.Error {
  filename := page.Title + ".txt"
  return ioutil.WriteFile(filename, page.Body, 0600)
}


func loadPage(title string) (*Page, os.Error) {
  filename := title + ".txt"
  body, err := ioutil.ReadFile(filename)
  if err != nil {
    return nil, err
  }
  return &Page{Title: title, Body: body}, nil
}

const lenPath = len("/view/")
func viewHandler(w http.ResponseWriter, r *http.Request) {
  title := r.URL.Path[lenPath:]
  page, _ := loadPage(title)
  fmt.Fprintf(w, "<h1>%s</h1><div>%s</div>", page.Title, page.Body)
}

func main() {
  http.HandleFunc("/view/", viewHandler)
  http.ListenAndServe("0.0.0.0:8080", nil)
  //page1 := &Page{Title: "TestPage", Body: []byte("Sample page")}
  //page1.save()
  //page2, _ := loadPage("TestPage")
  //fmt.Println(string(page2.Body))
}
